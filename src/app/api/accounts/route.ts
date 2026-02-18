import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { query, queryOne } from '@/lib/db/connection';
import type { ChartOfAccount, ChartOfAccountCreate } from '@/lib/types';

// GET - Listar plan de cuentas
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || session.CurrentCompanyId;
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    let sql = `
      SELECT * FROM ChartOfAccounts 
      WHERE CompanyId = @CompanyId
    `;
    
    if (activeOnly) {
      sql += ` AND IsActive = 1`;
    }
    
    sql += ` ORDER BY AccountCode`;

    const accounts = await query<ChartOfAccount>(sql, { CompanyId: companyId });

    return NextResponse.json({ Success: true, Data: accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ Success: false, Message: 'Error al obtener cuentas' }, { status: 500 });
  }
}

// POST - Crear cuenta contable
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'accounts', 'create')) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
    }

    const body: ChartOfAccountCreate = await request.json();

    // Validar datos requeridos
    if (!body.AccountCode || !body.AccountName || !body.Nature || !body.AccountType) {
      return NextResponse.json(
        { Success: false, Message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Verificar que no exista el código
    const existing = await queryOne<ChartOfAccount>(
      `SELECT AccountId FROM ChartOfAccounts 
       WHERE CompanyId = @CompanyId AND AccountCode = @AccountCode`,
      { CompanyId: body.CompanyId, AccountCode: body.AccountCode }
    );

    if (existing) {
      return NextResponse.json(
        { Success: false, Message: 'Ya existe una cuenta con este código' },
        { status: 400 }
      );
    }

    // Calcular nivel
    const parentAccount = body.ParentAccountId
      ? await queryOne<ChartOfAccount>(
          `SELECT AccountLevel FROM ChartOfAccounts WHERE AccountId = @AccountId`,
          { AccountId: body.ParentAccountId }
        )
      : null;
    
    const accountLevel = parentAccount ? parentAccount.AccountLevel + 1 : 1;

    // Insertar cuenta
    const result = await query<{ AccountId: number }>(
      `INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, 
         AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, 
         RequiresCostCenter, AllowsManualEntry, Currency, IsCashFlowItem, CreatedBy)
       VALUES (@CompanyId, @AccountCode, @AccountName, @ParentAccountId, 
         @AccountLevel, @Nature, @AccountType, @IsMovementsRequired, @RequiresThirdParty,
         @RequiresCostCenter, @AllowsManualEntry, @Currency, @IsCashFlowItem, @CreatedBy);
       SELECT SCOPE_IDENTITY() AS AccountId;`,
      {
        CompanyId: body.CompanyId || session.CurrentCompanyId,
        AccountCode: body.AccountCode,
        AccountName: body.AccountName,
        ParentAccountId: body.ParentAccountId || null,
        AccountLevel: accountLevel,
        Nature: body.Nature,
        AccountType: body.AccountType,
        IsMovementsRequired: body.IsMovementsRequired || false,
        RequiresThirdParty: body.RequiresThirdParty || false,
        RequiresCostCenter: body.RequiresCostCenter || false,
        AllowsManualEntry: body.AllowsManualEntry !== false,
        Currency: body.Currency || 'VES',
        IsCashFlowItem: body.IsCashFlowItem || false,
        CreatedBy: session.UserId,
      }
    );

    return NextResponse.json({ 
      Success: true, 
      Data: { AccountId: result[0].AccountId },
      Message: 'Cuenta creada exitosamente' 
    });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ Success: false, Message: 'Error al crear cuenta' }, { status: 500 });
  }
}

// PUT - Actualizar cuenta
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'accounts', 'edit')) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { AccountId, ...updateData } = body;

    // Verificar que la cuenta exista
    const existing = await queryOne<ChartOfAccount>(
      `SELECT * FROM ChartOfAccounts WHERE AccountId = @AccountId`,
      { AccountId }
    );

    if (!existing) {
      return NextResponse.json(
        { Success: false, Message: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    // Construir query de actualización dinámicamente
    const fields: string[] = [];
    const params: Record<string, unknown> = { AccountId };

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = @${key}`);
        params[key] = value;
      }
    });

    fields.push(`UpdatedAt = GETDATE()`, `UpdatedBy = @UpdatedBy`);
    params.UpdatedBy = session.UserId;

    await query(
      `UPDATE ChartOfAccounts SET ${fields.join(', ')} WHERE AccountId = @AccountId`,
      params
    );

    return NextResponse.json({ 
      Success: true, 
      Message: 'Cuenta actualizada exitosamente' 
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ Success: false, Message: 'Error al actualizar cuenta' }, { status: 500 });
  }
}

// DELETE - Eliminar cuenta (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'accounts', 'delete')) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = parseInt(searchParams.get('accountId') || '0');

    if (!accountId) {
      return NextResponse.json(
        { Success: false, Message: 'ID de cuenta requerido' },
        { status: 400 }
      );
    }

    // Soft delete
    await query(
      `UPDATE ChartOfAccounts SET IsActive = 0, UpdatedAt = GETDATE(), UpdatedBy = @UpdatedBy 
       WHERE AccountId = @AccountId`,
      { AccountId: accountId, UpdatedBy: session.UserId }
    );

    return NextResponse.json({ 
      Success: true, 
      Message: 'Cuenta eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ Success: false, Message: 'Error al eliminar cuenta' }, { status: 500 });
  }
}
