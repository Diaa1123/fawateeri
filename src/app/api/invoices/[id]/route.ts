import { NextResponse } from 'next/server';
import { getRecord, updateRecord, updateInvoice, updateVendorInvoice } from '@/lib/airtable';
import { Invoice } from '@/types/invoice';
import { ApiResponse } from '@/types/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/invoices/[id] - Get a single invoice by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get invoice from Airtable
    const { id } = await params;
    const invoice = await getRecord<Invoice>('Invoices', id);

    return NextResponse.json<ApiResponse<Invoice>>({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'حدث خطأ أثناء جلب الفاتورة' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices/[id] - Update invoice status
 * Only admin and viewer can update invoice status
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check role (only admin and viewer can update)
    const role = request.headers.get('x-user-role');

    if (role !== 'admin' && role !== 'viewer') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `غير مصرح. فقط الأدمن والمشاهد يمكنهم تحديث حالة الفاتورة. دورك الحالي: ${role || 'غير محدد'}` },
        { status: 403 }
      );
    }

    // 2. Parse body
    const body = await request.json();
    const { status, _source } = body;

    // 3. Validate status
    if (!status) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'الحالة مطلوبة' },
        { status: 400 }
      );
    }

    if (status !== 'جديدة' && status !== 'مدفوعة' && status !== 'ملغاة') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'الحالة يجب أن تكون: جديدة، مدفوعة، أو ملغاة' },
        { status: 400 }
      );
    }

    // 4. Prepare update fields
    const updateFields: Partial<Invoice> = {
      status,
    };

    const username = request.headers.get('x-username');

    // 5. If changing to "مدفوعة", add paid_at and paid_by
    if (status === 'مدفوعة') {
      updateFields.paid_at = new Date().toISOString().split('T')[0];
      updateFields.paid_by = username || 'غير معروف';
    }

    // 6. If changing to "ملغاة", add cancelled_at and cancelled_by
    if (status === 'ملغاة') {
      updateFields.cancelled_at = new Date().toISOString().split('T')[0];
      updateFields.cancelled_by = username || 'غير معروف';
    }

    // 7. Update invoice in the correct table based on _source
    const { id } = await params;
    let updatedInvoice: Invoice;

    if (_source === 'vendors') {
      updatedInvoice = await updateVendorInvoice(id, updateFields);
    } else {
      // Default to invoices table for backward compatibility
      updatedInvoice = await updateInvoice(id, updateFields);
    }

    return NextResponse.json<ApiResponse<Invoice>>({
      success: true,
      data: updatedInvoice,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'حدث خطأ أثناء تحديث الفاتورة' },
      { status: 500 }
    );
  }
}
