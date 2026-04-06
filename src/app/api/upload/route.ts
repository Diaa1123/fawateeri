import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/google-drive';
import { ApiResponse } from '@/types/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/upload - Upload PDF file to Google Drive
 *
 * Accepts: multipart/form-data with 'file' field
 * Returns: { fileId, url }
 */
export async function POST(request: Request) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'لم يتم رفع ملف. الرجاء اختيار ملف PDF' },
        { status: 400 }
      );
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'نوع الملف غير صحيح. يجب أن يكون PDF فقط' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `invoice_${timestamp}_${file.name}`;

    // Upload to Google Drive
    const result = await uploadFile(buffer, fileName, file.type);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الملف',
      },
      { status: 500 }
    );
  }
}
