import { NextResponse } from 'next/server';
import { listRecords, createRecord } from '@/lib/airtable';
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

    // Get invoices from Airtable
    const result = await listRecords<Invoice>('Invoices', {
      filterByFormula,
      maxRecords: limit ? parseInt(limit) : 50,
      offset: offset || undefined,
    });

    return NextResponse.json<ApiResponse<PaginatedResponse<Invoice>>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
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

    // Validate with Zod
    const validation = createInvoiceSchema.safeParse(body);

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

    // Create invoice in Airtable
    const newInvoice = await createRecord<Invoice>('Invoices', {
      invoice_number: data.invoice_number,
      vendor_name: data.vendor_name,
      amount: data.amount,
      currency: data.currency,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      pdf_url: data.pdf_url,
      payment_link: data.payment_link,
      notes: data.notes,
      source: 'يدوي' as const,
      status: 'جديدة',
      uploaded_by: username,
      uploaded_at: new Date().toISOString().split('T')[0],
      month_year: monthYear,
    });

    return NextResponse.json<ApiResponse<Invoice>>(
      {
        success: true,
        data: newInvoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الفاتورة',
      },
      { status: 500 }
    );
  }
}
