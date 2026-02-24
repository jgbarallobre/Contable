import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { query } from '@/lib/db/connection';
import type { Company, CompanyCreate } from '@/lib/types';

// GET - Listar empresas (todas las activas para admins, las propias para usuarios)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    let companies: Company[];
    
    // Si es admin (tiene permiso companies:* o companies:create), puede ver todas las empresas
    if (hasPermission(session, 'companies', 'create') || session.Permissions.includes('*:*')) {
      companies = await query<Company>(
        `SELECT * FROM Companies WHERE IsActive = 1 ORDER BY LegalName`
      );
    } else {
      // Usuarios normales solo ven las empresas asociadas
      companies = await query<Company>(
        `SELECT c.* 
         FROM Companies c
         INNER JOIN UserCompanies uc ON c.CompanyId = uc.CompanyId
         WHERE uc.UserId = @UserId AND uc.IsActive = 1 AND c.IsActive = 1
         ORDER BY c.LegalName`,
        { UserId: session.UserId }
      );
    }

    return NextResponse.json({ Success: true, Data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ Success: false, Message: 'Error al obtener empresas' }, { status: 500 });
  }
}

// POST - Crear empresa
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'companies', 'create')) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 403 });
    }

    const body: CompanyCreate = await request.json();

    // Validar datos requeridos
    if (!body.Code || !body.LegalName || !body.RIF || !body.FiscalAddress) {
      return NextResponse.json(
        { Success: false, Message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Insertar empresa
    const result = await query<{ CompanyId: number }>(
      `INSERT INTO Companies (Code, LegalName, CommercialName, RIF, FiscalAddress, Phone, Email, 
         Activity, FunctionalCurrency, SecondaryCurrency, IVAAliquot, ReducedIVAAliquot, 
         AdditionalIVAAliquot, IGTFAliquot, RetentionPercentage, ISLRRetentionPercentage, CreatedBy)
       VALUES (@Code, @LegalName, @CommercialName, @RIF, @FiscalAddress, @Phone, @Email, 
         @Activity, @FunctionalCurrency, @SecondaryCurrency, @IVAAliquot, @ReducedIVAAliquot,
         @AdditionalIVAAliquot, @IGTFAliquot, @RetentionPercentage, @ISLRRetentionPercentage, @CreatedBy);
       SELECT SCOPE_IDENTITY() AS CompanyId;`,
      {
        Code: body.Code,
        LegalName: body.LegalName,
        CommercialName: body.CommercialName || null,
        RIF: body.RIF,
        FiscalAddress: body.FiscalAddress,
        Phone: body.Phone || null,
        Email: body.Email || null,
        Activity: body.Activity || null,
        FunctionalCurrency: body.FunctionalCurrency || 'VES',
        SecondaryCurrency: body.SecondaryCurrency || 'USD',
        IVAAliquot: body.IVAAliquot || 16.00,
        ReducedIVAAliquot: body.ReducedIVAAliquot || 8.00,
        AdditionalIVAAliquot: body.AdditionalIVAAliquot || 31.50,
        IGTFAliquot: body.IGTFAliquot || 3.00,
        RetentionPercentage: body.RetentionPercentage || 75.00,
        ISLRRetentionPercentage: body.ISLRRetentionPercentage || 2.00,
        CreatedBy: session.UserId,
      }
    );

    const companyId = result[0].CompanyId;

    // Automatically add the creator to the company with full access
    await query(
      `INSERT INTO UserCompanies (UserId, CompanyId, Role, IsActive, CreatedBy)
       VALUES (@UserId, @CompanyId, 'ADMIN', 1, @CreatedBy)`,
      {
        UserId: session.UserId,
        CompanyId: companyId,
        CreatedBy: session.UserId,
      }
    );

    // Crear períodos contables para el año actual
    const currentYear = new Date().getFullYear();
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 0);
      
      await query(
        `INSERT INTO Periods (CompanyId, Year, Month, StartDate, EndDate, Status, CreatedBy)
         VALUES (@CompanyId, @Year, @Month, @StartDate, @EndDate, 'OPEN', @CreatedBy)`,
        {
          CompanyId: companyId,
          Year: currentYear,
          Month: month,
          StartDate: startDate.toISOString().split('T')[0],
          EndDate: endDate.toISOString().split('T')[0],
          CreatedBy: session.UserId,
        }
      );
    }

    return NextResponse.json({ 
      Success: true, 
      Data: { CompanyId: companyId },
      Message: 'Empresa creada exitosamente' 
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ Success: false, Message: 'Error al crear empresa' }, { status: 500 });
  }
}
