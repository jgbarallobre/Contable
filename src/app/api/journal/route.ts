import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { query, queryOne, withTransaction } from '@/lib/db/connection';
import type { JournalEntryCreate, JournalEntryHeader, JournalEntryLine, Period } from '@/lib/types';

// GET - Listar asientos
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || session.CurrentCompanyId;
    const periodId = searchParams.get('periodId');
    const status = searchParams.get('status');
    const entryType = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search'); // Búsqueda: número, descripción, referencia
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    let sql = `
      SELECT h.*, u.Username AS CreatedByName, p.Username AS ApprovedByName
      FROM JournalEntryHeaders h
      LEFT JOIN Users u ON h.CreatedBy = u.UserId
      LEFT JOIN Users p ON h.ApprovedBy = p.UserId
      WHERE h.CompanyId = @CompanyId
    `;
    const params: Record<string, unknown> = { CompanyId: companyId };

    if (periodId) {
      sql += ` AND h.PeriodId = @PeriodId`;
      params.PeriodId = periodId;
    }

    if (status) {
      sql += ` AND h.Status = @Status`;
      params.Status = status;
    }

    if (entryType) {
      sql += ` AND h.EntryType = @EntryType`;
      params.EntryType = entryType;
    }

    if (dateFrom) {
      sql += ` AND h.EntryDate >= @DateFrom`;
      params.DateFrom = dateFrom;
    }

    if (dateTo) {
      sql += ` AND h.EntryDate <= @DateTo`;
      params.DateTo = dateTo;
    }

    // Búsqueda por número, descripción o referencia
    if (search) {
      sql += ` AND (h.EntryNumber LIKE @Search OR h.Description LIKE @Search OR h.Reference LIKE @Search)`;
      params.Search = `%${search}%`;
    }

    // Contar total
    const countResult = await query<{ Total: number }>(
      `SELECT COUNT(*) AS Total FROM (${sql}) AS sub`,
      params
    );
    const total = countResult[0].Total;

    // Obtener datos con paginación
    sql += ` ORDER BY h.EntryDate DESC, h.EntryNumber DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY`;
    params.Offset = (page - 1) * pageSize;
    params.PageSize = pageSize;

    const entries = await query<JournalEntryHeader>(sql, params);

    return NextResponse.json({
      Success: true,
      Data: entries,
      Total: total,
      Page: page,
      PageSize: pageSize,
      TotalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ Success: false, Message: 'Error al obtener asientos' }, { status: 500 });
  }
}

// GET - Obtener un asiento específico con sus líneas
export async function GET_ONE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entryId = parseInt(searchParams.get('id') || '0');

    if (!entryId) {
      return NextResponse.json({ Success: false, Message: 'ID de asiento requerido' }, { status: 400 });
    }

    // Obtener encabezado
    const header = await queryOne<JournalEntryHeader>(
      `SELECT * FROM JournalEntryHeaders WHERE EntryId = @EntryId`,
      { EntryId: entryId }
    );

    if (!header) {
      return NextResponse.json({ Success: false, Message: 'Asiento no encontrado' }, { status: 404 });
    }

    // Obtener líneas
    const lines = await query(
      `SELECT jl.*, ca.AccountCode, ca.AccountName, tp.LegalName AS ThirdPartyName
       FROM JournalEntryLines jl
       INNER JOIN ChartOfAccounts ca ON jl.AccountId = ca.AccountId
       LEFT JOIN ThirdParties tp ON jl.ThirdPartyId = tp.ThirdPartyId
       WHERE jl.EntryId = @EntryId
       ORDER BY jl.LineNumber`,
      { EntryId: entryId }
    );

    return NextResponse.json({
      Success: true,
      Data: { ...header, Lines: lines },
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json({ Success: false, Message: 'Error al obtener asiento' }, { status: 500 });
  }
}

// POST - Crear asiento contable
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'journal', 'create')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body: JournalEntryCreate = await request.json();

    // Usar CompanyId del body o de la sesión
    const companyId = body.CompanyId || session.CurrentCompanyId;
    const periodId = body.PeriodId;

    // Validar datos requeridos
    if (!companyId || !body.EntryDate || !body.Description || !body.Lines?.length) {
      return NextResponse.json(
        { Success: false, Message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Obtener período del body o buscar el período abierto automáticamente
    let finalPeriodId = periodId;
    if (!finalPeriodId) {
      const openPeriod = await queryOne<Period>(
        `SELECT PeriodId FROM Periods WHERE CompanyId = @CompanyId AND Status = 'OPEN'`,
        { CompanyId: companyId }
      );
      if (!openPeriod) {
        return NextResponse.json(
          { Success: false, Message: 'No hay un período contable abierto' },
          { status: 400 }
        );
      }
      finalPeriodId = openPeriod.PeriodId;
    }

    // Verificar que el período esté abierto
    const period = await queryOne<Period>(
      `SELECT * FROM Periods WHERE PeriodId = @PeriodId AND Status = 'OPEN'`,
      { PeriodId: finalPeriodId }
    );

    if (!period) {
      return NextResponse.json(
        { Success: false, Message: 'El período contable está cerrado' },
        { status: 400 }
      );
    }

    // Obtener siguiente número de comprobante
    const seqResult = await query<{ CurrentNumber: number }>(
      `SELECT CurrentNumber FROM DocumentSequences 
       WHERE CompanyId = @CompanyId AND DocumentType = @EntryType`,
      { CompanyId: companyId, EntryType: body.EntryType }
    );

    let entryNumber: string;
    if (seqResult.length > 0) {
      const newNumber = seqResult[0].CurrentNumber + 1;
      entryNumber = newNumber.toString().padStart(6, '0');
      
      await query(
        `UPDATE DocumentSequences SET CurrentNumber = @NewNumber WHERE CompanyId = @CompanyId AND DocumentType = @EntryType`,
        { CompanyId: companyId, EntryType: body.EntryType, NewNumber: newNumber }
      );
    } else {
      entryNumber = '000001';
      
      await query(
        `INSERT INTO DocumentSequences (CompanyId, DocumentType, CurrentNumber) VALUES (@CompanyId, @EntryType, 1)`,
        { CompanyId: companyId, EntryType: body.EntryType }
      );
    }

    // VALIDACIÓN: Partida doble (debe = haber)
    const totalDebit = body.Lines.reduce((sum, line) => sum + (line.Debit || 0), 0);
    const totalCredit = body.Lines.reduce((sum, line) => sum + (line.Credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { 
          Success: false, 
          Message: `Asiento descuadrado. Total Debe: ${totalDebit}, Total Haber: ${totalCredit}` 
        },
        { status: 400 }
      );
    }

    // Transacción para crear el asiento
    const result = await withTransaction(async (transaction) => {
      // Insertar encabezado
      const headerResult = await transaction.request()
        .input('CompanyId', companyId)
        .input('PeriodId', finalPeriodId)
        .input('EntryType', body.EntryType)
        .input('EntryNumber', entryNumber)
        .input('EntryDate', body.EntryDate)
        .input('Description', body.Description)
        .input('Reference', body.Reference || null)
        .input('Currency', body.Currency || 'VES')
        .input('ExchangeRate', body.ExchangeRate || 1)
        .input('TotalDebit', totalDebit)
        .input('TotalCredit', totalCredit)
        .input('CreatedBy', session.UserId)
        .query(`
          INSERT INTO JournalEntryHeaders (CompanyId, PeriodId, EntryType, EntryNumber, EntryDate, 
            Description, Reference, Currency, ExchangeRate, TotalDebit, TotalCredit, Status, CreatedBy)
          VALUES (@CompanyId, @PeriodId, @EntryType, @EntryNumber, @EntryDate, 
            @Description, @Reference, @Currency, @ExchangeRate, @TotalDebit, @TotalCredit, 'DRAFT', @CreatedBy);
          SELECT SCOPE_IDENTITY() AS EntryId;
        `);

      const entryId = (headerResult.recordset[0] as { EntryId: number }).EntryId;

      // Insertar líneas
      for (let i = 0; i < body.Lines.length; i++) {
        const line = body.Lines[i];
        
        // Calcular monto base en moneda funcional
        const exchangeRate = line.ExchangeRate || body.ExchangeRate || 1;
        const baseAmount = (line.Debit || line.Credit) * exchangeRate;

        await transaction.request()
          .input('EntryId', entryId)
          .input('LineNumber', i + 1)
          .input('AccountId', line.AccountId)
          .input('ThirdPartyId', line.ThirdPartyId || null)
          .input('CostCenterId', line.CostCenterId || null)
          .input('Description', line.Description || null)
          .input('Debit', line.Debit || 0)
          .input('Credit', line.Credit || 0)
          .input('Currency', line.Currency || body.Currency || 'VES')
          .input('ExchangeRate', exchangeRate)
          .input('BaseAmount', baseAmount)
          .input('Reference', line.Reference || null)
          .input('TaxBase', line.TaxBase || 0)
          .input('IVAAmount', line.IVAAmount || 0)
          .input('IGTFAmount', line.IGTFAmount || 0)
          .input('IsIGTFApplicable', line.IsIGTFApplicable || false)
          .input('CreatedBy', session.UserId)
          .query(`
            INSERT INTO JournalEntryLines (EntryId, LineNumber, AccountId, ThirdPartyId, CostCenterId,
              Description, Debit, Credit, Currency, ExchangeRate, BaseAmount, Reference,
              TaxBase, IVAAmount, IGTFAmount, IsIGTFApplicable, CreatedBy)
            VALUES (@EntryId, @LineNumber, @AccountId, @ThirdPartyId, @CostCenterId,
              @Description, @Debit, @Credit, @Currency, @ExchangeRate, @BaseAmount, @Reference,
              @TaxBase, @IVAAmount, @IGTFAmount, @IsIGTFApplicable, @CreatedBy)
          `);
      }

      return entryId;
    });

    return NextResponse.json({
      Success: true,
      Data: { EntryId: result },
      Message: `Asiento ${entryNumber} creado exitosamente`,
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json({ Success: false, Message: 'Error al crear asiento' }, { status: 500 });
  }
}

// PUT - Aprobar asiento
export async function APPROVE(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'journal', 'approve')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { EntryId } = body;

    if (!EntryId) {
      return NextResponse.json({ Success: false, Message: 'ID de asiento requerido' }, { status: 400 });
    }

    // Verificar que el asiento exista y esté en estado DRAFT
    const entry = await queryOne<JournalEntryHeader>(
      `SELECT * FROM JournalEntryHeaders WHERE EntryId = @EntryId AND Status = 'DRAFT'`,
      { EntryId }
    );

    if (!entry) {
      return NextResponse.json(
        { Success: false, Message: 'Asiento no encontrado o ya aprobado' },
        { status: 404 }
      );
    }

    // Aprobar
    await query(
      `UPDATE JournalEntryHeaders 
       SET Status = 'APPROVED', ApprovedBy = @ApprovedBy, ApprovedAt = GETDATE()
       WHERE EntryId = @EntryId`,
      { EntryId, ApprovedBy: session.UserId }
    );

    return NextResponse.json({
      Success: true,
      Message: 'Asiento aprobado exitosamente',
    });
  } catch (error) {
    console.error('Error approving journal entry:', error);
    return NextResponse.json({ Success: false, Message: 'Error al aprobar asiento' }, { status: 500 });
  }
}

// PUT - Anular asiento
export async function ANNUL(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'journal', 'annul')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { EntryId, Reason } = body;

    if (!EntryId || !Reason) {
      return NextResponse.json(
        { Success: false, Message: 'ID de asiento y motivo requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el asiento esté aprobado
    const entry = await queryOne<JournalEntryHeader>(
      `SELECT * FROM JournalEntryHeaders WHERE EntryId = @EntryId AND Status = 'APPROVED'`,
      { EntryId }
    );

    if (!entry) {
      return NextResponse.json(
        { Success: false, Message: 'Asiento no encontrado o no está aprobado' },
        { status: 404 }
      );
    }

    // Anular
    await query(
      `UPDATE JournalEntryHeaders 
       SET Status = 'ANNULED', AnnulledBy = @AnnulledBy, AnnulledAt = GETDATE(), AnnulmentReason = @Reason
       WHERE EntryId = @EntryId`,
      { EntryId, AnnulledBy: session.UserId, Reason }
    );

    return NextResponse.json({
      Success: true,
      Message: 'Asiento anulado exitosamente',
    });
  } catch (error) {
    console.error('Error annulling journal entry:', error);
    return NextResponse.json({ Success: false, Message: 'Error al anular asiento' }, { status: 500 });
  }
}

// PUT - Reversar asiento (crear asiento inverso)
export async function REVERSE(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'journal', 'reverse')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { EntryId } = body;

    if (!EntryId) {
      return NextResponse.json({ Success: false, Message: 'ID de asiento requerido' }, { status: 400 });
    }

    // Obtener asiento original
    const original = await queryOne<JournalEntryHeader>(
      `SELECT * FROM JournalEntryHeaders WHERE EntryId = @EntryId`,
      { EntryId }
    );

    if (!original) {
      return NextResponse.json({ Success: false, Message: 'Asiento no encontrado' }, { status: 404 });
    }

    // Obtener líneas originales
    const originalLines = await query<JournalEntryLine>(
      `SELECT * FROM JournalEntryLines WHERE EntryId = @EntryId`,
      { EntryId }
    );

    // Crear asiento de reverso
    const newEntryNumber = original.EntryNumber + '-R';
    const result = await withTransaction(async (transaction) => {
      // Insertar encabezado de reverso
      const headerResult = await transaction.request()
        .input('CompanyId', original.CompanyId)
        .input('PeriodId', original.PeriodId)
        .input('EntryType', 'ADJUSTMENT')
        .input('EntryNumber', newEntryNumber)
        .input('EntryDate', new Date().toISOString().split('T')[0])
        .input('Description', `REVERSO: ${original.Description}`)
        .input('Reference', `Revierte: ${original.EntryNumber}`)
        .input('Currency', original.Currency)
        .input('ExchangeRate', original.ExchangeRate)
        .input('TotalDebit', original.TotalCredit)
        .input('TotalCredit', original.TotalDebit)
        .input('CreatedBy', session.UserId)
        .query(`
          INSERT INTO JournalEntryHeaders (CompanyId, PeriodId, EntryType, EntryNumber, EntryDate, 
            Description, Reference, Currency, ExchangeRate, TotalDebit, TotalCredit, Status, CreatedBy, ReversedByEntryId)
          VALUES (@CompanyId, @PeriodId, @EntryType, @EntryNumber, @EntryDate, 
            @Description, @Reference, @Currency, @ExchangeRate, @TotalDebit, @TotalCredit, 'APPROVED', @CreatedBy, @EntryId);
          SELECT SCOPE_IDENTITY() AS EntryId;
        `);

      const newEntryId = (headerResult.recordset[0] as { EntryId: number }).EntryId;

      // Insertar líneas invertidas
      for (const line of originalLines) {
        await transaction.request()
          .input('EntryId', newEntryId)
          .input('LineNumber', line.LineNumber)
          .input('AccountId', line.AccountId)
          .input('ThirdPartyId', line.ThirdPartyId)
          .input('CostCenterId', line.CostCenterId)
          .input('Description', line.Description)
          .input('Debit', line.Credit)
          .input('Credit', line.Debit)
          .input('Currency', line.Currency)
          .input('ExchangeRate', line.ExchangeRate)
          .input('BaseAmount', line.BaseAmount)
          .input('Reference', line.Reference)
          .input('TaxBase', line.TaxBase)
          .input('IVAAmount', line.IVAAmount)
          .input('IGTFAmount', line.IGTFAmount)
          .input('IsIGTFApplicable', line.IsIGTFApplicable)
          .input('CreatedBy', session.UserId)
          .query(`
            INSERT INTO JournalEntryLines (EntryId, LineNumber, AccountId, ThirdPartyId, CostCenterId,
              Description, Debit, Credit, Currency, ExchangeRate, BaseAmount, Reference,
              TaxBase, IVAAmount, IGTFAmount, IsIGTFApplicable, CreatedBy)
            VALUES (@EntryId, @LineNumber, @AccountId, @ThirdPartyId, @CostCenterId,
              @Description, @Debit, @Credit, @Currency, @ExchangeRate, @BaseAmount, @Reference,
              @TaxBase, @IVAAmount, @IGTFAmount, @IsIGTFApplicable, @CreatedBy)
          `);
      }

      return newEntryId;
    });

    return NextResponse.json({
      Success: true,
      Data: { EntryId: result },
      Message: `Asiento ${original.EntryNumber} revertido exitosamente como ${newEntryNumber}`,
    });
  } catch (error) {
    console.error('Error reversing journal entry:', error);
    return NextResponse.json({ Success: false, Message: 'Error al reversar asiento' }, { status: 500 });
  }
}
