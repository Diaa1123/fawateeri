import { NextResponse } from 'next/server';
import { listRecords, createRecord, createVendorInvoice, getAllInvoices, getVendorInvoices, getEmailInvoices } from '@/lib/airtable';
import { Invoice } from '@/types/invoice';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { createInvoiceSchema } from '@/lib/validations';

/**
 * GET /api/invoices - Get list of invoices with filters
 *
 * Query params:
 * - status: "جديدة" | "مدفوعة" (optional)
 * - month_year: "2026-04" (optional)
 * - limit: number (optional, default: 50)
 * - offset: string (optional, for pagination)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const status = searchParams.get('status');
    const monthYear = searchParams.get('month_year');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build filter formula for Airtable
    const filters: string[] = [];

    if (status) {
      filters.push(`{status} = '${status}'`);
    }

    if (monthYear) {
      filters.push(`{month_year} = '${monthYear}'`);
    }

    // Combine filters with AND
    const filterByFormula = filters.length > 0
      ? `AND(${filters.join(', ')})`
      : undefined;

    // Get invoices from BOTH tables (Invoices + Vendors) and merge them
    const [emailInvoicesResult, vendorsResult] = await Promise.all([
      // Invoices table (email/webhook source) with field mapping
      getEmailInvoices(filterByFormula),
      // Vendors table (manual input) with field mapping
      getVendorInvoices(filterByFormula),
    ]);

    // Merge both sources (both are already mapped with _source field)
    const allRecords = [...emailInvoicesResult.records, ...vendorsResult.records];

    // Sort by invoice_date descending (newest first)
    const sortedRecords = allRecords.sort((a, b) => {
      // Handle missing or invalid dates
      const dateA = a.invoice_date ? new Date(a.invoice_date).getTime() : 0;
      const dateB = b.invoice_date ? new Date(b.invoice_date).getTime() : 0;

      // Check for invalid dates (NaN)
      const validDateA = isNaN(dateA) ? 0 : dateA;
      const validDateB = isNaN(dateB) ? 0 : dateB;

      return validDateB - validDateA;
    });

    return NextResponse.json<ApiResponse<PaginatedResponse<Invoice>>>({
      success: true,
      data: {
        records: sortedRecords,
        offset: vendorsResult.offset, // Use vendor's offset for pagination
      },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب الفواتير',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices - Create a new invoice
 *
 * All authenticated users can create invoices (admin, viewer, team)
 */
export async function POST(request: Request) {
  try {
    // Get user info from headers (set by middleware)
    const username = request.headers.get('x-username');

    if (!username) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'غير مصرح. الرجاء تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();

    // Extract _source and remove internal fields
    const { _source, invoice_number, ...invoiceData } = body;

    // Validate with Zod
    const validation = createInvoiceSchema.safeParse(invoiceData);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'بيانات غير صحيحة';
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Extract month_year from invoice_date (YYYY-MM)
    const monthYear = data.invoice_date.substring(0, 7);

    // Convert PDF to Airtable attachment format if provided
    // Note: Airtable only accepts HTTP/HTTPS URLs, not base64 data
    let airtableAttachment = undefined;
    if (data.invoice_file) {
      if (data.invoice_file.base64 && data.invoice_file.filename) {
        // Base64 data - Skip for now (needs Google Drive upload in Phase 2)
        // TODO: Upload to Google Drive first, then use the URL
        airtableAttachment = undefined;
      } else if (data.invoice_file.url) {
        // Regular HTTP/HTTPS URL
        airtableAttachment = [{ url: data.invoice_file.url }];
      } else if (Array.isArray(data.invoice_file)) {
        // Already in Airtable format
        airtableAttachment = data.invoice_file;
      }
    }

    // Prepare invoice data for Airtable
    const invoicePayload: Partial<Invoice> = {
      vendor_name: data.vendor_name,
      amount: data.amount,
      currency: data.currency || 'SAR',
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      notes: data.notes,
      source: 'يدوي' as const,
      status: 'جديدة' as const,
      uploaded_by: username,
      uploaded_at: new Date().toISOString().split('T')[0],
      month_year: monthYear,
      // Vendors table specific fields
      payment_URL: data.payment_URL || data.payment_link,
      email: data.email,
      currency_preference: data.currency_preference,
      invoice_file: airtableAttachment,
    };

    // Create invoice in correct table based on _source
    let newInvoice: Invoice;
    if (_source === 'vendors') {
      // Create in Vendors table (manual invoices from /add page)
      newInvoice = await createVendorInvoice(invoicePayload);
    } else {
      // Create in Invoices table (email/webhook invoices) - legacy support
      newInvoice = await createRecord<Invoice>('Invoices', {
        ...invoicePayload,
        pdf_url: data.pdf_url,
        payment_link: data.payment_link,
      });
    }

    return NextResponse.json<ApiResponse<Invoice>>(
      {
        success: true,
        data: newInvoice,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الفاتورة',
      },
      { status: 500 }
    );
  }
}
