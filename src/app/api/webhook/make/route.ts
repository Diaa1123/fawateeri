import { NextResponse } from 'next/server';
import { createRecord } from '@/lib/airtable';
import { analyzeInvoiceText } from '@/lib/openai';
import { Invoice } from '@/types/invoice';
import { ApiResponse } from '@/types/api';

const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET;

if (!MAKE_WEBHOOK_SECRET) {
  throw new Error('MAKE_WEBHOOK_SECRET environment variable is required');
}

/**
 * POST /api/webhook/make - Receive invoices from Make.com automation
 *
 * This is a public endpoint (no JWT required)
 * Verifies Make.com webhook secret for security
 */
export async function POST(request: Request) {
  try {
    // 1. Verify webhook secret from header
    const webhookSecret = request.headers.get('x-make-webhook-secret');

    if (!webhookSecret || webhookSecret !== MAKE_WEBHOOK_SECRET) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized webhook request' },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await request.json();
    const {
      invoice_number,
      vendor_name,
      amount,
      currency = 'SAR',
      invoice_date,
      due_date,
      pdf_url,
      source_email,
      email_subject,
      raw_text,
      needs_ai_analysis = false,
      payment_link,
      notes,
    } = body;

    // 3. Validate required fields
    if (!invoice_number || !vendor_name || !amount || !invoice_date || !pdf_url) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields: invoice_number, vendor_name, amount, invoice_date, pdf_url' },
        { status: 400 }
      );
    }

    let finalData = {
      invoice_number,
      vendor_name,
      amount: parseFloat(amount),
      currency,
      invoice_date,
      due_date: due_date || invoice_date,
      pdf_url,
      payment_link,
      notes: notes || `من الإيميل: ${source_email}\nالموضوع: ${email_subject}`,
      source: 'إيميل' as const,
    };

    // 4. If needs AI analysis, call AI endpoint
    if (needs_ai_analysis && raw_text) {
      try {
        const aiResult = await analyzeInvoiceText(raw_text);

        // Merge AI extracted data with provided data (AI data takes precedence if available)
        if (aiResult.extracted) {
          finalData = {
            ...finalData,
            invoice_number: aiResult.extracted.invoice_number || finalData.invoice_number,
            vendor_name: aiResult.extracted.vendor_name || finalData.vendor_name,
            amount: aiResult.extracted.amount || finalData.amount,
            currency: aiResult.extracted.currency || finalData.currency,
            invoice_date: aiResult.extracted.invoice_date || finalData.invoice_date,
            due_date: aiResult.extracted.due_date || finalData.due_date,
          };

          // Add AI confidence to notes
          if (finalData.notes) {
            finalData.notes += `\n\nتحليل AI: ${aiResult.confidence === 'high' ? 'دقة عالية' : aiResult.confidence === 'medium' ? 'دقة متوسطة' : 'دقة منخفضة'}`;
          }
        }
      } catch (error) {
        // If AI fails, continue with original data
      }
    }

    // 5. Extract month_year from invoice_date
    const monthYear = finalData.invoice_date.substring(0, 7);

    // 6. Create invoice in Airtable
    const newInvoice = await createRecord<Invoice>('Invoices', {
      invoice_number: finalData.invoice_number,
      vendor_name: finalData.vendor_name,
      amount: finalData.amount,
      currency: finalData.currency,
      invoice_date: finalData.invoice_date,
      due_date: finalData.due_date,
      pdf_url: finalData.pdf_url,
      payment_link: finalData.payment_link,
      notes: finalData.notes,
      source: finalData.source,
      status: 'جديدة',
      uploaded_by: 'Make.com Automation',
      uploaded_at: new Date().toISOString(),
      month_year: monthYear,
    });

    return NextResponse.json({
      success: true,
      invoiceId: newInvoice.id,
      message: 'Invoice created successfully from Make.com',
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}
