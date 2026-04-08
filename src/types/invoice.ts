export type InvoiceStatus = "جديدة" | "مدفوعة" | "ملغاة";
export type InvoiceSource = "إيميل" | "يدوي";
export type InvoiceTableSource = "invoices" | "vendors";

export interface AirtableAttachment {
  url: string;
  filename?: string;
}

export interface Invoice {
  id: string;
  invoice_number?: string;
  vendor_name?: string;
  amount?: number;
  currency?: string;
  invoice_date?: string; // ISO date
  due_date?: string; // ISO date
  status?: InvoiceStatus;
  pdf_url?: string;
  invoice_file?: AirtableAttachment[] | any; // Airtable attachment format (من جدول Vendors)
  payment_URL?: string; // تم تغييره من payment_link
  payment_link?: string; // للتوافق مع الكود القديم - سيتم إزالته لاحقاً
  uploaded_by?: string;
  uploaded_at?: string;
  paid_at?: string;
  paid_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  notes?: string;
  source?: InvoiceSource;
  month_year?: string; // "2026-04"
  email?: string; // من جدول Vendors
  currency_preference?: string; // من جدول Vendors

  // حقول داخلية لتمييز المصدر - لا تُرسل لـ Airtable
  _source?: InvoiceTableSource; // من أي جدول جاءت (invoices أو vendors)
  _tableId?: string; // Table ID المستخدم في PATCH
}
