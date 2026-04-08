'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Upload, Sparkles } from 'lucide-react';

// Validation schema
const invoiceSchema = z.object({
  pdf_file: z.any().optional(),
  // invoice_number is computed by Airtable - not needed
  vendor_name: z.string().min(1, 'اسم المورد مطلوب'),
  amount: z.number().positive('المبلغ مطلوب ويجب أن يكون أكبر من صفر'),
  currency: z.string().optional(),
  currency_preference: z.string().optional(),
  invoice_date: z.string().min(1, 'تاريخ الفاتورة مطلوب'),
  due_date: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  payment_URL: z.string().optional(),
  payment_link: z.string().optional(),
  email: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function InvoiceForm({ onSubmit, isSubmitting = false }: InvoiceFormProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      vendor_name: '',
      currency: 'SAR',
      invoice_date: today,
      due_date: today,
      payment_URL: '',
      email: '',
      notes: '',
    },
  });

  // Handle PDF file upload - convert to base64 and send with invoice data
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setUploadingPdf(true);

    try {
      // Convert file to base64 for Airtable attachment
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Set the base64 data with filename
        setPdfUrl(JSON.stringify({
          filename: file.name,
          data: base64String
        }));
        setUploadingPdf(false);
      };
      reader.onerror = () => {
        throw new Error('فشل قراءة الملف');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading PDF:', error);
      alert(error instanceof Error ? error.message : 'فشل قراءة الملف. يمكنك المتابعة بدون PDF.');
      setPdfFile(null);
      setUploadingPdf(false);
    }

    /* DISABLED: Google Drive upload - uncomment when credentials are fixed
    setUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل رفع الملف');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setPdfUrl(data.data.url);
      } else {
        throw new Error(data.error || 'فشل رفع الملف');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert(error instanceof Error ? error.message : 'فشل رفع الملف. يمكنك المتابعة بدون PDF.');
      setPdfFile(null);
      setPdfUrl(null);
    } finally {
      setUploadingPdf(false);
    }
    */
  };

  // Handle AI analysis
  const handleAiAnalysis = async () => {
    if (!pdfUrl) return;

    setAiAnalyzing(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pdf_url: pdfUrl }),
      });

      if (!response.ok) {
        throw new Error('فشل التحليل الذكي');
      }

      const data = await response.json();

      // Fill form with AI results (invoice_number is auto-generated, skip it)
      if (data.vendor_name) setValue('vendor_name', data.vendor_name);
      if (data.amount) setValue('amount', parseFloat(data.amount));
      if (data.currency) setValue('currency', data.currency);
      if (data.invoice_date) setValue('invoice_date', data.invoice_date);
      if (data.due_date) setValue('due_date', data.due_date);
      if (data.email) setValue('email', data.email);
      if (data.payment_URL) setValue('payment_URL', data.payment_URL);
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      alert('فشل التحليل الذكي. حاول مرة أخرى.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const onFormSubmit = async (data: InvoiceFormData) => {
    let pdfAttachment = undefined;

    // If pdfUrl contains base64 data, prepare it for Airtable
    if (pdfUrl) {
      try {
        const pdfData = JSON.parse(pdfUrl);
        if (pdfData.filename && pdfData.data) {
          // Send base64 data - backend will convert to Airtable attachment
          pdfAttachment = {
            filename: pdfData.filename,
            base64: pdfData.data
          };
        }
      } catch {
        // If not JSON, might be a regular URL
        pdfAttachment = { url: pdfUrl };
      }
    }

    const formData = {
      ...data,
      // For Vendors table, use invoice_file (Airtable Attachment format)
      invoice_file: pdfAttachment,
      pdf_url: pdfUrl || '', // Keep for backward compatibility
    };
    await onSubmit(formData as any);
  };

  const currencyOptions = [
    { value: 'SAR', label: 'ريال سعودي (SAR)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* PDF Upload */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          رفع ملف PDF (اختياري)
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-150
              ${pdfFile ? 'border-accent-green bg-accent-green/10' : 'border-border-default hover:border-accent-blue bg-bg-card'}`}
          >
            <Upload className={`w-6 h-6 ${pdfFile ? 'text-accent-green' : 'text-text-muted'}`} />
            <div className="text-center">
              {pdfFile ? (
                <>
                  <p className="text-accent-green font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-text-muted mt-1">تم الرفع بنجاح</p>
                </>
              ) : (
                <>
                  <p className="text-text-primary font-medium">اضغط لرفع ملف PDF</p>
                  <p className="text-sm text-text-muted mt-1">أو اسحب الملف وأفلته هنا</p>
                </>
              )}
            </div>
          </label>
          {uploadingPdf && (
            <div className="absolute inset-0 bg-bg-card/80 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">جاري الرفع...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Button */}
      {pdfUrl && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleAiAnalysis}
          isLoading={aiAnalyzing}
          className="w-full flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{aiAnalyzing ? 'جاري التحليل الذكي...' : 'تحليل ذكي - تعبئة تلقائية'}</span>
        </Button>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="اسم المورد *"
          {...register('vendor_name')}
          error={errors.vendor_name?.message}
          placeholder="مثال: شركة التوريدات"
        />

        <Input
          label="البريد الإلكتروني (اختياري)"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="vendor@example.com"
        />

        <Input
          label="المبلغ *"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
          placeholder="0.00"
        />

        <Select
          label="العملة"
          {...register('currency')}
          options={currencyOptions}
          error={errors.currency?.message}
        />

        <Input
          label="تاريخ الفاتورة *"
          type="date"
          {...register('invoice_date')}
          error={errors.invoice_date?.message}
        />

        <Input
          label="تاريخ الاستحقاق *"
          type="date"
          {...register('due_date')}
          error={errors.due_date?.message}
        />
      </div>

      <Input
        label="رابط الدفع (اختياري)"
        type="url"
        {...register('payment_URL')}
        error={errors.payment_URL?.message}
        placeholder="https://example.com/pay/..."
      />

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          ملاحظات (اختياري)
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-default text-text-primary
            focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue
            disabled:opacity-50 transition-colors duration-150 resize-none"
          placeholder="أضف أي ملاحظات إضافية..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-accent-red">{errors.notes.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        حفظ الفاتورة
      </Button>
    </form>
  );
}
