import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Lazy initialization - only create client when needed
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  return openai;
}

export interface ExtractedInvoiceData {
  invoice_number?: string;
  vendor_name?: string;
  amount?: number;
  currency?: string;
  invoice_date?: string;
  due_date?: string;
}

export interface AnalysisResult {
  extracted: ExtractedInvoiceData;
  confidence: 'high' | 'medium' | 'low';
  rawResponse?: string;
}

/**
 * Analyze invoice text using GPT-4o to extract structured data
 *
 * @param text - Invoice text content to analyze
 * @returns Extracted invoice data with confidence level
 */
export async function analyzeInvoiceText(text: string): Promise<AnalysisResult> {
  try {
    const prompt = `أنت مساعد ذكي متخصص في تحليل الفواتير واستخراج البيانات منها.

قم بتحليل النص التالي واستخراج البيانات المطلوبة بدقة:

النص:
${text}

استخرج البيانات التالية بصيغة JSON فقط (بدون أي نص إضافي):
{
  "invoice_number": "رقم الفاتورة",
  "vendor_name": "اسم المورد أو الشركة",
  "amount": المبلغ الإجمالي (رقم فقط بدون عملة),
  "currency": "العملة (SAR أو USD أو غيرها)",
  "invoice_date": "تاريخ الفاتورة بصيغة YYYY-MM-DD",
  "due_date": "تاريخ الاستحقاق بصيغة YYYY-MM-DD"
}

ملاحظات:
- إذا لم تجد أي حقل، ضعه null
- amount يجب أن يكون رقم فقط (بدون فواصل أو عملة)
- التواريخ يجب أن تكون بصيغة ISO (YYYY-MM-DD)
- العملة الافتراضية في السعودية هي SAR

أرجع JSON فقط بدون أي نص آخر.`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكي متخصص في تحليل الفواتير. ترجع فقط JSON صحيح بدون أي نص إضافي.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return {
        extracted: {},
        confidence: 'low',
      };
    }

    // Parse JSON response
    const extracted: ExtractedInvoiceData = JSON.parse(content);

    // Determine confidence based on how many fields were extracted
    const fieldsExtracted = Object.values(extracted).filter(
      (value) => value !== null && value !== undefined && value !== ''
    ).length;

    let confidence: 'high' | 'medium' | 'low';
    if (fieldsExtracted >= 5) {
      confidence = 'high';
    } else if (fieldsExtracted >= 3) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      extracted,
      confidence,
      rawResponse: content,
    };
  } catch (error) {
    // Return empty result if AI fails
    return {
      extracted: {},
      confidence: 'low',
    };
  }
}

/**
 * Analyze invoice from PDF URL
 * Note: This is a placeholder - actual PDF text extraction would require additional libraries
 *
 * @param pdfUrl - URL of the PDF to analyze
 * @returns Extracted invoice data with confidence level
 */
export async function analyzeInvoiceFromPDF(pdfUrl: string): Promise<AnalysisResult> {
  // For now, return low confidence with a note
  // In a real implementation, you would:
  // 1. Download the PDF from the URL
  // 2. Extract text using a library like pdf-parse or pdfjs
  // 3. Pass the extracted text to analyzeInvoiceText()

  return {
    extracted: {},
    confidence: 'low',
  };
}
