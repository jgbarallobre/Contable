import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { query, withTransaction } from '@/lib/db/connection';
import type { Period } from '@/lib/types';

// GET - Listar períodos
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId') || session.CurrentCompanyId;
  const year = searchParams.get('year');
  const status = searchParams.get('status');

  try {
    let sql = `SELECT * FROM Periods WHERE CompanyId = @CompanyId`;
    const params: Record<string, unknown> = { CompanyId: companyId };

    if (year) {
      sql += ` AND Year = @Year`;
      params.Year = year;
    }

    if (status) {
      sql += ` AND Status = @Status`;
      params.Status = status;
    }

    sql += ` ORDER BY Year DESC, Month DESC`;

    const periods = await query<Period>(sql, params);
    return NextResponse.json({ Success: true, Data: periods });
  } catch (error) {
    console.error('Error fetching periods:', error);
    return NextResponse.json({ Success: false, Message: 'Error al obtener períodos' }, { status: 500 });
  }
}

// PUT - Cerrar período
export async function CLOSE(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'periods', 'close')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { PeriodId, Note } = body;

    if (!PeriodId) {
      return NextResponse.json({ Success: false, Message: 'ID de período requerido' }, { status: 400 });
    }

    // Verificar que el período esté abierto
    const period = await query<Period>(
      `SELECT * FROM Periods WHERE PeriodId = @PeriodId AND Status = 'OPEN'`,
      { PeriodId }
    );

    if (!period.length) {
      return NextResponse.json({ Success: false, Message: 'Período no encontrado o ya cerrado' }, { status: 404 });
    }

    // Verificar que el asiento esté cuadrado
    const balance = await query<{ TotalDebit: number; TotalCredit: number }>(
      `SELECT SUM(TotalDebit) AS TotalDebit, SUM(TotalCredit) AS TotalCredit
       FROM JournalEntryHeaders
       WHERE PeriodId = @PeriodId AND Status = 'APPROVED'`,
      { PeriodId }
    );

    if (balance[0].TotalDebit !== balance[0].TotalCredit) {
      return NextResponse.json(
        { Success: false, Message: 'El período tiene asientos descuadrados' },
        { status: 400 }
      );
    }

    // Cerrar período
    await query(
      `UPDATE Periods 
       SET Status = 'CLOSED', ClosingDate = GETDATE(), ClosedBy = @ClosedBy, 
           ClosedAt = GETDATE(), ClosingNote = @Note
       WHERE PeriodId = @PeriodId`,
      { PeriodId, ClosedBy: session.UserId, Note: Note || null }
    );

    return NextResponse.json({ Success: true, Message: 'Período cerrado exitosamente' });
  } catch (error) {
    console.error('Error closing period:', error);
    return NextResponse.json({ Success: false, Message: 'Error al cerrar período' }, { status: 500 });
  }
}

// PUT - Reabrir período
export async function REOPEN(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'periods', 'reopen')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { PeriodId, Note } = body;

    if (!PeriodId) {
      return NextResponse.json({ Success: false, Message: 'ID de período requerido' }, { status: 400 });
    }

    // Verificar que el período esté cerrado
    const period = await query<Period>(
      `SELECT * FROM Periods WHERE PeriodId = @PeriodId AND Status = 'CLOSED'`,
      { PeriodId }
    );

    if (!period.length) {
      return NextResponse.json({ Success: false, Message: 'Período no encontrado o no está cerrado' }, { status: 404 });
    }

    // Verificar que no tenga período siguiente cerrado
    const nextPeriod = await query<Period>(
      `SELECT * FROM Periods 
       WHERE CompanyId = @CompanyId AND Year = @Year AND Month = @Month + 1 AND Status = 'OPEN'`,
      { 
        CompanyId: period[0].CompanyId, 
        Year: period[0].Year, 
        Month: period[0].Month 
      }
    );

    if (!nextPeriod.length) {
      // Reabrir período
      await query(
        `UPDATE Periods 
         SET Status = 'OPEN', ReopenedBy = @ReopenedBy, ReopenedAt = GETDATE(), ReopeningNote = @Note
         WHERE PeriodId = @PeriodId`,
        { PeriodId, ReopenedBy: session.UserId, Note: Note || null }
      );

      return NextResponse.json({ Success: true, Message: 'Período reopened exitosamente' });
    }

    return NextResponse.json(
      { Success: false, Message: 'No se puede reopen un período que tiene el siguiente período abierto' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error reopening period:', error);
    return NextResponse.json({ Success: false, Message: 'Error al reopen período' }, { status: 500 });
  }
}
