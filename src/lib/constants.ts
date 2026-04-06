/**
 * Invoice statuses
 */
export const INVOICE_STATUS = {
  NEW: 'جديدة',
  PAID: 'مدفوعة',
  CANCELLED: 'ملغاة',
} as const;

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

/**
 * Invoice status colors (CSS custom properties)
 */
export const INVOICE_STATUS_COLORS = {
  'جديدة': 'accent-red',      // Red for new invoices
  'مدفوعة': 'accent-green',    // Green for paid
  'ملغاة': 'accent-red',       // Red for cancelled
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
  TEAM: 'team',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Invoice sources
 */
export const INVOICE_SOURCE = {
  EMAIL: 'إيميل',
  MANUAL: 'يدوي',
} as const;

export type InvoiceSource = typeof INVOICE_SOURCE[keyof typeof INVOICE_SOURCE];

/**
 * Currencies
 */
export const CURRENCIES = {
  SAR: 'SAR',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

/**
 * Arabic months
 */
export const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

/**
 * Role display names
 */
export const ROLE_NAMES: Record<UserRole, string> = {
  admin: 'مدير النظام',
  viewer: 'مشاهد',
  team: 'فريق العمل',
};
