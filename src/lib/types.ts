// ============================================================
// TIPOS DEL SISTEMA CONTABLE VENEZUELA
// ============================================================

// ==================== EMPRESAS ====================
export interface Company {
  CompanyId: number;
  Code: string;
  LegalName: string;
  CommercialName?: string;
  RIF: string;
  FiscalAddress: string;
  Phone?: string;
  Email?: string;
  Activity?: string;
  FunctionalCurrency: string;
  SecondaryCurrency?: string;
  IVAAliquot: number;
  ReducedIVAAliquot: number;
  AdditionalIVAAliquot: number;
  IGTFAliquot: number;
  RetentionPercentage: number;
  ISLRRetentionPercentage: number;
  IsActive: boolean;
  CreatedAt: string;
  CreatedBy?: number;
  UpdatedAt?: string;
  UpdatedBy?: number;
}

export interface CompanyCreate {
  Code: string;
  LegalName: string;
  CommercialName?: string;
  RIF: string;
  FiscalAddress: string;
  Phone?: string;
  Email?: string;
  Activity?: string;
  FunctionalCurrency?: string;
  SecondaryCurrency?: string;
  IVAAliquot?: number;
  ReducedIVAAliquot?: number;
  AdditionalIVAAliquot?: number;
  IGTFAliquot?: number;
  RetentionPercentage?: number;
  ISLRRetentionPercentage?: number;
}

// ==================== USUARIOS ====================
export interface User {
  UserId: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone?: string;
  IsActive: boolean;
  IsBlocked: boolean;
  Is2FAEnabled: boolean;
  MustChangePassword: boolean;
  LastLoginAt?: string;
  FailedLoginAttempts: number;
  CreatedAt: string;
}

export interface UserCreate {
  Username: string;
  Email: string;
  Password: string;
  FirstName: string;
  LastName: string;
  Phone?: string;
}

export interface UserCompany {
  UserCompanyId: number;
  UserId: number;
  CompanyId: number;
  RoleId: number;
  IsDefault: boolean;
  IsActive: boolean;
}

// ==================== ROLES Y PERMISOS ====================
export interface Role {
  RoleId: number;
  CompanyId?: number;
  Name: string;
  Description?: string;
  IsSystem: boolean;
  IsActive: boolean;
  CreatedAt: string;
}

export interface Permission {
  PermissionId: number;
  Module: string;
  Action: string;
  Description?: string;
  IsActive: boolean;
}

export interface RolePermission {
  RolePermissionId: number;
  RoleId: number;
  PermissionId: number;
  GrantedAt: string;
}

// ==================== PLAN DE CUENTAS ====================
export interface ChartOfAccount {
  AccountId: number;
  CompanyId: number;
  AccountCode: string;
  AccountName: string;
  ParentAccountId?: number;
  AccountLevel: number;
  Nature: 'DEBITOR' | 'CREDITOR';
  AccountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE' | 'OFFBALANCE';
  IsMovementsRequired: boolean;
  RequiresThirdParty: boolean;
  RequiresCostCenter: boolean;
  AllowsManualEntry: boolean;
  Currency: string;
  IsActive: boolean;
  IsCashFlowItem: boolean;
  CreatedAt: string;
  CreatedBy?: number;
}

export interface ChartOfAccountCreate {
  CompanyId: number;
  AccountCode: string;
  AccountName: string;
  ParentAccountId?: number;
  Nature: 'DEBITOR' | 'CREDITOR';
  AccountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE' | 'OFFBALANCE';
  IsMovementsRequired?: boolean;
  RequiresThirdParty?: boolean;
  RequiresCostCenter?: boolean;
  AllowsManualEntry?: boolean;
  Currency?: string;
  IsCashFlowItem?: boolean;
}

// ==================== TERCEROS ====================
export interface ThirdParty {
  ThirdPartyId: number;
  CompanyId: number;
  ThirdPartyType: 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE' | 'OTHER';
  RIF: string;
  LegalName: string;
  CommercialName?: string;
  FiscalAddress?: string;
  Phone?: string;
  Email?: string;
  ContactPerson?: string;
  TaxCategory?: 'ORDINARY' | 'SPECIAL' | 'EXENT';
  IsWithholdingAgent: boolean;
  IVAApplicable: boolean;
  ISLRApplicable: boolean;
  IsActive: boolean;
  CreatedAt: string;
}

export interface ThirdPartyCreate {
  CompanyId: number;
  ThirdPartyType: 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE' | 'OTHER';
  RIF: string;
  LegalName: string;
  CommercialName?: string;
  FiscalAddress?: string;
  Phone?: string;
  Email?: string;
  ContactPerson?: string;
  TaxCategory?: 'ORDINARY' | 'SPECIAL' | 'EXENT';
  IsWithholdingAgent?: boolean;
  IVAApplicable?: boolean;
  ISLRApplicable?: boolean;
}

// ==================== PERIODOS ====================
export interface Period {
  PeriodId: number;
  CompanyId: number;
  Year: number;
  Month: number;
  StartDate: string;
  EndDate: string;
  Status: 'OPEN' | 'CLOSED' | 'LOCKED';
  ClosingDate?: string;
  ClosedBy?: number;
  ClosedAt?: string;
  ClosingNote?: string;
  ReopenedBy?: number;
  ReopenedAt?: string;
  ReopeningNote?: string;
  CreatedAt: string;
}

export interface PeriodCreate {
  CompanyId: number;
  Year: number;
  Month: number;
}

// ==================== ASIENTOS CONTABLES ====================
export interface JournalEntryHeader {
  EntryId: number;
  CompanyId: number;
  PeriodId: number;
  EntryType: 'DAILY' | 'INCOME' | 'EXPENSE' | 'ADJUSTMENT' | 'CLOSING';
  EntryNumber: string;
  EntryDate: string;
  Description: string;
  Reference?: string;
  Status: 'DRAFT' | 'APPROVED' | 'ANNULED';
  IsAutomatic: boolean;
  AutomaticSource?: string;
  ApprovedBy?: number;
  ApprovedAt?: string;
  AnnulledBy?: number;
  AnnulledAt?: string;
  AnnulmentReason?: string;
  ReversedById?: number;
  ReversedByEntryId?: number;
  TotalDebit: number;
  TotalCredit: number;
  Currency: string;
  ExchangeRate: number;
  CreatedAt: string;
  CreatedBy?: number;
}

export interface JournalEntryLine {
  LineId: number;
  EntryId: number;
  LineNumber: number;
  AccountId: number;
  ThirdPartyId?: number;
  CostCenterId?: number;
  Description?: string;
  Debit: number;
  Credit: number;
  Currency: string;
  ExchangeRate: number;
  BaseAmount: number;
  Reference?: string;
  TaxBase: number;
  IVAAmount: number;
  IGTFAmount: number;
  IsIGTFApplicable: boolean;
  CreatedAt: string;
}

export interface JournalEntryCreate {
  CompanyId: number;
  PeriodId: number;
  EntryType: 'DAILY' | 'INCOME' | 'EXPENSE' | 'ADJUSTMENT';
  EntryDate: string;
  Description: string;
  Reference?: string;
  Currency?: string;
  ExchangeRate?: number;
  Lines: JournalEntryLineCreate[];
}

export interface JournalEntryLineCreate {
  AccountId: number;
  ThirdPartyId?: number;
  CostCenterId?: number;
  Description?: string;
  Debit: number;
  Credit: number;
  Currency?: string;
  ExchangeRate?: number;
  Reference?: string;
  TaxBase?: number;
  IVAAmount?: number;
  IGTFAmount?: number;
  IsIGTFApplicable?: boolean;
}

// ==================== LIBROS FISCALES ====================
export interface PurchaseBook {
  PurchaseId: number;
  CompanyId: number;
  PeriodId: number;
  TaxDocumentType: 'INVOICE' | 'IMPORT' | 'DEBIT_NOTE';
  DocumentNumber: string;
  ControlNumber?: string;
  DocumentDate: string;
  TaxPeriod: string;
  SupplierId: number;
  SupplierRIF: string;
  SupplierName: string;
  ImportedAmount: number;
  TaxableAmount: number;
  IVAAmount: number;
  ReducedTaxableAmount: number;
  ReducedIVAAmount: number;
  AdditionalTaxableAmount: number;
  AdditionalIVAAmount: number;
  IGTFAmount: number;
  IGTFBaseAmount: number;
  ISLRRetentionAmount: number;
  RetainableIVA: number;
  RetainedIVA: number;
  RetainedBy?: string;
  AdjustmentAmount: number;
  AdjustmentReason?: string;
  IsExempt: boolean;
  ExemptReason?: string;
  Status: 'PENDING' | 'REGISTERED' | 'ADJUSTED';
  EntryId?: number;
  CreatedAt: string;
}

export interface SalesBook {
  SaleId: number;
  CompanyId: number;
  PeriodId: number;
  TaxDocumentType: 'INVOICE' | 'CASH_RECEIPT' | 'CREDIT_NOTE' | 'DELIVERY';
  DocumentNumber: string;
  ControlNumber?: string;
  DocumentDate: string;
  TaxPeriod: string;
  CustomerId: number;
  CustomerRIF: string;
  CustomerName: string;
  SaleType: 'DOMESTIC' | 'EXPORT' | 'EXEMPT';
  TotalAmount: number;
  TaxableAmount: number;
  IVAAmount: number;
  ReducedTaxableAmount: number;
  ReducedIVAAmount: number;
  AdditionalTaxableAmount: number;
  AdditionalIVAAmount: number;
  IGTFAmount: number;
  ISLRRetentionAmount: number;
  ExemptAmount: number;
  AdjustmentAmount: number;
  AdjustmentReason?: string;
  Status: 'PENDING' | 'REGISTERED' | 'ADJUSTED';
  EntryId?: number;
  CreatedAt: string;
}

// ==================== TASAS DE CAMBIO ====================
export interface ExchangeRate {
  RateId: number;
  CompanyId: number;
  FromCurrency: string;
  ToCurrency: string;
  RateDate: string;
  Rate: number;
  RateType: 'OFFICIAL' | 'BANK' | 'PARALLEL';
  Source?: string;
  IsActive: boolean;
  CreatedAt: string;
}

// ==================== AUDITORÍA ====================
export interface AuditLog {
  AuditId: number;
  CompanyId?: number;
  UserId?: number;
  Action: string;
  EntityType: string;
  EntityId?: number;
  PreviousValue?: string;
  NewValue?: string;
  Reason?: string;
  IPAddress?: string;
  UserAgent?: string;
  MachineName?: string;
  SessionId?: string;
  Timestamp: string;
}

// ==================== AUTENTICACIÓN ====================
export interface LoginRequest {
  Username: string;
  Password: string;
}

export interface LoginResponse {
  Success: boolean;
  Token?: string;
  User?: User;
  Company?: Company;
  Permissions?: Permission[];
  Message?: string;
}

export interface AuthUser {
  UserId: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  CurrentCompanyId: number;
  CurrentRoleId: number;
  Permissions: string[];
}

// ==================== REPORTES ====================
export interface TrialBalanceRow {
  CompanyId: number;
  AccountCode: string;
  AccountName: string;
  Nature: string;
  AccountType: string;
  AccountLevel: number;
  Balance: number;
  TotalDebit: number;
  TotalCredit: number;
}

export interface GeneralLedgerRow {
  EntryId: number;
  EntryNumber: string;
  EntryDate: string;
  Description: string;
  LineNumber: number;
  Reference: string;
  ThirdPartyName: string;
  Debit: number;
  Credit: number;
  RunningBalance: number;
  Status: string;
  CreatedBy: string;
}

export interface IncomeStatementRow {
  AccountCode: string;
  AccountName: string;
  Category: 'INCOME' | 'EXPENSE';
  Amount: number;
}

export interface BalanceSheetRow {
  Section: 'ASSET' | 'LIABILITY' | 'EQUITY';
  AccountCode: string;
  AccountName: string;
  Balance: number;
}

export interface IGTFReportRow {
  EntryNumber: string;
  EntryDate: string;
  Description: string;
  ThirdParty: string;
  RIF: string;
  BaseImponible: number;
  Alicuota: number;
  IGTF: number;
}

// ==================== RESPUESTAS API ====================
export interface ApiResponse<T> {
  Success: boolean;
  Data?: T;
  Message?: string;
  Errors?: string[];
}

export interface PaginatedResponse<T> {
  Success: boolean;
  Data: T[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}
