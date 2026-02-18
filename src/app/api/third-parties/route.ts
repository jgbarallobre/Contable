import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { query } from '@/lib/db/connection';
import type { ThirdParty, ThirdPartyCreate } from '@/lib/types';

// GET - Listar terceros
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId') || session.CurrentCompanyId;
  const type = searchParams.get('type'); // CUSTOMER, SUPPLIER, EMPLOYEE, OTHER
  const activeOnly = searchParams.get('activeOnly') !== 'false';
  const search = searchParams.get('search');

  try {
    let sql = `SELECT * FROM ThirdParties WHERE CompanyId = @CompanyId`;
    const params: Record<string, unknown> = { CompanyId: companyId };

    if (type) {
      sql += ` AND ThirdPartyType = @Type`;
      params.Type = type;
    }

    if (activeOnly) {
      sql += ` AND IsActive = 1`;
    }

    if (search) {
      sql += ` AND (LegalName LIKE @Search OR RIF LIKE @Search OR CommercialName LIKE @Search)`;
      params.Search = `%${search}%`;
    }

    sql += ` ORDER BY LegalName`;

    const thirdParties = await query<ThirdParty>(sql, params);
    return NextResponse.json({ Success: true, Data: thirdParties });
  } catch (error) {
    console.error('Error fetching third parties:', error);
    return NextResponse.json({ Success: false, Message: 'Error al obtener terceros' }, { status: 500 });
  }
}

// POST - Crear tercero
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'thirdparties', 'create')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body: ThirdPartyCreate = await request.json();

    // Validar datos requeridos
    if (!body.ThirdPartyType || !body.RIF || !body.LegalName) {
      return NextResponse.json(
        { Success: false, Message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Verificar RIF único
    const existing = await query<{ ThirdPartyId: number }>(
      `SELECT ThirdPartyId FROM ThirdParties 
       WHERE CompanyId = @CompanyId AND RIF = @RIF`,
      { CompanyId: body.CompanyId, RIF: body.RIF }
    );

    if (existing.length) {
      return NextResponse.json(
        { Success: false, Message: 'Ya existe un tercero con este RIF' },
        { status: 400 }
      );
    }

    const result = await query<{ ThirdPartyId: number }>(
      `INSERT INTO ThirdParties (CompanyId, ThirdPartyType, RIF, LegalName, CommercialName, 
         FiscalAddress, Phone, Email, ContactPerson, TaxCategory, IsWithholdingAgent, 
         IVAApplicable, ISLRApplicable, CreatedBy)
       VALUES (@CompanyId, @ThirdPartyType, @RIF, @LegalName, @CommercialName, 
         @FiscalAddress, @Phone, @Email, @ContactPerson, @TaxCategory, @IsWithholdingAgent,
         @IVAApplicable, @ISLRApplicable, @CreatedBy);
       SELECT SCOPE_IDENTITY() AS ThirdPartyId;`,
      {
        CompanyId: body.CompanyId || session.CurrentCompanyId,
        ThirdPartyType: body.ThirdPartyType,
        RIF: body.RIF,
        LegalName: body.LegalName,
        CommercialName: body.CommercialName || null,
        FiscalAddress: body.FiscalAddress || null,
        Phone: body.Phone || null,
        Email: body.Email || null,
        ContactPerson: body.ContactPerson || null,
        TaxCategory: body.TaxCategory || 'ORDINARY',
        IsWithholdingAgent: body.IsWithholdingAgent || false,
        IVAApplicable: body.IVAApplicable !== false,
        ISLRApplicable: body.ISLRApplicable !== false,
        CreatedBy: session.UserId,
      }
    );

    return NextResponse.json({
      Success: true,
      Data: { ThirdPartyId: result[0].ThirdPartyId },
      Message: 'Tercero creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating third party:', error);
    return NextResponse.json({ Success: false, Message: 'Error al crear tercero' }, { status: 500 });
  }
}

// PUT - Actualizar tercero
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'thirdparties', 'edit')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { ThirdPartyId, ...updateData } = body;

    if (!ThirdPartyId) {
      return NextResponse.json({ Success: false, Message: 'ID de tercero requerido' }, { status: 400 });
    }

    // Construir query de actualización
    const fields: string[] = [];
    const params: Record<string, unknown> = { ThirdPartyId };

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = @${key}`);
        params[key] = value;
      }
    });

    fields.push(`UpdatedAt = GETDATE()`, `UpdatedBy = @UpdatedBy`);
    params.UpdatedBy = session.UserId;

    await query(
      `UPDATE ThirdParties SET ${fields.join(', ')} WHERE ThirdPartyId = @ThirdPartyId`,
      params
    );

    return NextResponse.json({ Success: true, Message: 'Tercero actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating third party:', error);
    return NextResponse.json({ Success: false, Message: 'Error al actualizar tercero' }, { status: 500 });
  }
}

// DELETE - Eliminar tercero (soft delete)
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, 'thirdparties', 'delete')) {
    return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const thirdPartyId = parseInt(searchParams.get('id') || '0');

  if (!thirdPartyId) {
    return NextResponse.json({ Success: false, Message: 'ID de tercero requerido' }, { status: 400 });
  }

  try {
    await query(
      `UPDATE ThirdParties SET IsActive = 0, UpdatedAt = GETDATE(), UpdatedBy = @UpdatedBy 
       WHERE ThirdPartyId = @ThirdPartyId`,
      { ThirdPartyId: thirdPartyId, UpdatedBy: session.UserId }
    );

    return NextResponse.json({ Success: true, Message: 'Tercero eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting third party:', error);
    return NextResponse.json({ Success: false, Message: 'Error al eliminar tercero' }, { status: 500 });
  }
}
