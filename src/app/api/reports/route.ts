import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { executeProcedure, query } from '@/lib/db/connection';
import type { 
  TrialBalanceRow, 
  GeneralLedgerRow, 
  IncomeStatementRow, 
  BalanceSheetRow,
  IGTFReportRow 
} from '@/lib/types';

// GET - Generar reportes
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get('type');
  const companyId = searchParams.get('companyId') || session.CurrentCompanyId;
  const periodId = searchParams.get('periodId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const accountId = searchParams.get('accountId');
  const thirdPartyId = searchParams.get('thirdPartyId');

  if (!reportType) {
    return NextResponse.json({ Success: false, Message: 'Tipo de reporte requerido' }, { status: 400 });
  }

  try {
    switch (reportType) {
      case 'trial_balance': {
        // Balance de Comprobación
        if (!periodId) {
          return NextResponse.json({ Success: false, Message: 'Período requerido' }, { status: 400 });
        }
        
        const trialBalance = await executeProcedure<TrialBalanceRow>(
          'sp_GetTrialBalance',
          { CompanyId: companyId, PeriodId: periodId, DateFrom: dateFrom, DateTo: dateTo }
        );
        
        // Calcular totales
        const totalDebit = trialBalance.reduce((sum, row) => sum + row.TotalDebit, 0);
        const totalCredit = trialBalance.reduce((sum, row) => sum + row.TotalCredit, 0);
        
        return NextResponse.json({
          Success: true,
          Data: trialBalance,
          Summary: { totalDebit, totalCredit, diferencia: totalDebit - totalCredit }
        });
      }

      case 'general_ledger': {
        // Mayor General
        if (!accountId || !dateFrom || !dateTo) {
          return NextResponse.json({ Success: false, Message: 'Cuenta y rango de fechas requeridos' }, { status: 400 });
        }
        
        const ledger = await executeProcedure<GeneralLedgerRow>(
          'sp_GetGeneralLedger',
          { 
            CompanyId: companyId, 
            AccountId: accountId, 
            DateFrom: dateFrom, 
            DateTo: dateTo,
            ThirdPartyId: thirdPartyId || null 
          }
        );
        
        return NextResponse.json({ Success: true, Data: ledger });
      }

      case 'income_statement': {
        // Estado de Resultados
        if (!periodId) {
          return NextResponse.json({ Success: false, Message: 'Período requerido' }, { status: 400 });
        }
        
        const incomeStatement = await executeProcedure<IncomeStatementRow>(
          'sp_GetIncomeStatement',
          { CompanyId: companyId, PeriodId: periodId }
        );
        
        // Calcular totales
        const income = incomeStatement
          .filter(row => row.Category === 'INCOME')
          .reduce((sum, row) => sum + row.Amount, 0);
        const expenses = incomeStatement
          .filter(row => row.Category === 'EXPENSE')
          .reduce((sum, row) => sum + row.Amount, 0);
        
        return NextResponse.json({
          Success: true,
          Data: incomeStatement,
          Summary: { income, expenses, netResult: income - expenses }
        });
      }

      case 'balance_sheet': {
        // Balance General
        if (!periodId) {
          return NextResponse.json({ Success: false, Message: 'Período requerido' }, { status: 400 });
        }
        
        const balanceSheet = await executeProcedure<BalanceSheetRow>(
          'sp_GetBalanceSheet',
          { CompanyId: companyId, PeriodId: periodId }
        );
        
        // Calcular totales
        const assets = balanceSheet
          .filter(row => row.Section === 'ASSET')
          .reduce((sum, row) => sum + row.Balance, 0);
        const liabilities = balanceSheet
          .filter(row => row.Section === 'LIABILITY')
          .reduce((sum, row) => sum + row.Balance, 0);
        const equity = balanceSheet
          .filter(row => row.Section === 'EQUITY')
          .reduce((sum, row) => sum + row.Balance, 0);
        
        return NextResponse.json({
          Success: true,
          Data: balanceSheet,
          Summary: { assets, liabilities, equity, balanced: assets === liabilities + equity }
        });
      }

      case 'purchase_book': {
        // Libro de Compras IVA
        if (!hasPermission(session, 'reports', 'view')) {
          return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
        }
        
        if (!periodId) {
          return NextResponse.json({ Success: false, Message: 'Período requerido' }, { status: 400 });
        }
        
        const purchases = await executeProcedure(
          'sp_GetPurchaseBook',
          { CompanyId: companyId, PeriodId: periodId }
        );
        
        // Calcular totales
        const totals = (purchases as Array<Record<string, number>>).reduce(
          (acc, row) => ({
            totalAmount: acc.totalAmount + (row.ImportedAmount || 0),
            totalTaxable: acc.totalTaxable + (row.TaxableAmount || 0),
            totalIVA: acc.totalIVA + (row.IVAAmount || 0),
            totalIGTF: acc.totalIGTF + (row.IGTFAmount || 0),
          }),
          { totalAmount: 0, totalTaxable: 0, totalIVA: 0, totalIGTF: 0 }
        );
        
        return NextResponse.json({
          Success: true,
          Data: purchases,
          Summary: totals
        });
      }

      case 'sales_book': {
        // Libro de Ventas IVA
        if (!hasPermission(session, 'reports', 'view')) {
          return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
        }
        
        if (!periodId) {
          return NextResponse.json({ Success: false, Message: 'Período requerido' }, { status: 400 });
        }
        
        const sales = await executeProcedure(
          'sp_GetSalesBook',
          { CompanyId: companyId, PeriodId: periodId }
        );
        
        // Calcular totales
        const totals = (sales as Array<Record<string, number>>).reduce(
          (acc, row) => ({
            totalAmount: acc.totalAmount + (row.TotalAmount || 0),
            totalTaxable: acc.totalTaxable + (row.TaxableAmount || 0),
            totalIVA: acc.totalIVA + (row.IVAAmount || 0),
            totalExempt: acc.totalExempt + (row.ExemptAmount || 0),
          }),
          { totalAmount: 0, totalTaxable: 0, totalIVA: 0, totalExempt: 0 }
        );
        
        return NextResponse.json({
          Success: true,
          Data: sales,
          Summary: totals
        });
      }

      case 'igtf': {
        // Reporte IGTF
        if (!hasPermission(session, 'reports', 'view')) {
          return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
        }
        
        if (!periodId) {
          return NextResponse.json({ Success: false, Message: 'Período requerido' }, { status: 400 });
        }
        
        const igtf = await executeProcedure<IGTFReportRow>(
          'sp_GetIGTFReport',
          { CompanyId: companyId, PeriodId: periodId }
        );
        
        const totalIGTF = igtf.reduce((sum, row) => sum + row.IGTF, 0);
        
        return NextResponse.json({
          Success: true,
          Data: igtf,
          Summary: { totalIGTF }
        });
      }

      case 'general_journal': {
        // Diario General
        if (!dateFrom || !dateTo) {
          return NextResponse.json({ Success: false, Message: 'Rango de fechas requerido' }, { status: 400 });
        }
        
        const journal = await executeProcedure(
          'sp_GetGeneralJournal',
          { CompanyId: companyId, DateFrom: dateFrom, DateTo: dateTo }
        );
        
        return NextResponse.json({ Success: true, Data: journal });
      }

      default:
        return NextResponse.json({ Success: false, Message: 'Tipo de reporte no válido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ Success: false, Message: 'Error al generar reporte' }, { status: 500 });
  }
}
