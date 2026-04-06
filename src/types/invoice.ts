export type InvoiceStatus = "جديدة" | "مدفوعة" | "ملغاة";
export type InvoiceSource = "إيميل" | "يدوي";

export interface Invoice {
  id: string;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  currency: string;
  invoice_date: string; // ISO date
  due_date: string; // ISO date
  status: InvoiceStatus;
  pdf_url: string;
  payment_link?: string;
  uploaded_by: string;
  uploaded_at: string;
  paid_at?: string;
  paid_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  notes?: string;
  source: InvoiceSource;
  month_year: string; // "2026-04"
}
