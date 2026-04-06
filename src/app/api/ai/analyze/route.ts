import { NextResponse } from 'next/server';
import { analyzeInvoiceText, analyzeInvoiceFromPDF } from '@/lib/openai';
import { ApiResponse } from '@/types/api';
import type { AnalysisResult } from '@/lib/openai';

/**
 * POST /api/ai/analyze - Analyze invoice using AI (GPT-4o)
 *
 * Body: { text: "..." } OR { pdfUrl: "..." }
 * Returns: { extracted: {...}, confidence: "high" | "medium" | "low" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, pdfUrl } = body;

    // Validate that either text or pdfUrl is provided
    if (!text && !pdfUrl) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'يجب توفير محتوى نصي (text) أو رابط PDF (pdfUrl)' },
        { status: 400 }
      );
    }

    let result: AnalysisResult;

    // Analyze based on input type
    if (text) {
      // Validate text length
      if (text.length < 10) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'النص قصير جداً. يجب أن يكون على الأقل 10 أحرف' },
          { status: 400 }
        );
      }

      if (text.length > 10000) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'النص طويل جداً. الحد الأقصى 10,000 حرف' },
          { status: 400 }
        );
      }

      result = await analyzeInvoiceText(text);
    } else {
      // Analyze from PDF URL
      result = await analyzeInvoiceFromPDF(pdfUrl);

      // If PDF analysis is not implemented yet, inform the user
      if (result.confidence === 'low' && Object.keys(result.extracted).length === 0) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'تحليل PDF غير مدعوم حالياً. الرجاء استخدام النص المستخرج من PDF',
          },
          { status: 501 }
        );
      }
    }

    return NextResponse.json<ApiResponse<AnalysisResult>>({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'حدث خطأ أثناء تحليل الفاتورة. الرجاء المحاولة مرة أخرى',
      },
      { status: 500 }
    );
  }
}
