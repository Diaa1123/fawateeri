'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { FileText, ExternalLink, Calendar, DollarSign, CheckCircle, Link as LinkIcon, CreditCard, ChevronDown, ChevronUp, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { PDFViewer } from '@/components/shared/PDFViewer';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InvoiceCardProps {
  invoice: Invoice;
  showMarkAsPaid?: boolean;
}

export function InvoiceCard({ invoice, showMarkAsPaid = false }: InvoiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const { user} = useAuth();
  const queryClient = useQueryClient();

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'مدفوعة',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث الفاتورة');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setIsConfirmOpen(false);
    },
    onError: (error: Error) => {
      alert(error.message || 'حدث خطأ أثناء تحديث الفاتورة إلى مدفوعة');
    },
  });

  // Mark as cancelled mutation
  const markAsCancelledMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'ملغاة',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث الفاتورة');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setIsCancelConfirmOpen(false);
    },
    onError: (error: Error) => {
      alert(error.message || 'حدث خطأ أثناء إلغاء الفاتورة');
    },
  });

  const handleMarkAsPaid = () => {
    markAsPaidMutation.mutate();
  };

  const handleCancel = () => {
    markAsCancelledMutation.mutate();
  };

  const handleContactVendor = () => {
    // TODO: سيتم ربطه بإرسال إيميل لاحقاً
    alert('سيتم تفعيل هذه الميزة قريباً - إرسال إيميل للمزود');
  };

  // Check if user can mark as paid (admin or viewer only)
  const canMarkAsPaid = showMarkAsPaid && user && (user.role === 'admin' || user.role === 'viewer');
  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-6 hover:border-border-accent transition-colors duration-150">
      {/* Tags Row */}
      <div className="flex items-center gap-2 mb-4">
        {/* Source Badge */}
        {invoice.source === 'إيميل' ? (
          <Badge variant="default">
            📧 Airtable
          </Badge>
        ) : (
          <Badge variant="info">
            👤 {invoice.uploaded_by}
          </Badge>
        )}

        {/* New Invoice Badge */}
        {invoice.status === 'جديدة' && (
          <Badge variant="danger">
            فاتورة جديدة
          </Badge>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 flex-1 text-start"
        >
          <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{invoice.vendor_name}</h3>
            <p className="text-sm text-text-muted">#{invoice.invoice_number}</p>
          </div>
        </button>

        {/* Amount & Expand Button */}
        <div className="flex items-center gap-2">
          <div className="text-end">
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(invoice.amount, invoice.currency)}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors duration-150"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">تاريخ الفاتورة</p>
            <p className="text-sm text-text-secondary">{formatDateShort(invoice.invoice_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">تاريخ الاستحقاق</p>
            <p className="text-sm text-text-secondary">{formatDateShort(invoice.due_date)}</p>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mb-4 p-4 rounded-lg bg-bg-primary border border-border-default space-y-3">
          {invoice.notes && (
            <div>
              <p className="text-xs text-text-muted mb-1">ملاحظات</p>
              <p className="text-sm text-text-secondary">{invoice.notes}</p>
            </div>
          )}
          {invoice.pdf_url && (
            <div>
              <p className="text-xs text-text-muted mb-2">معاينة الفاتورة</p>
              <button
                onClick={() => setIsPdfViewerOpen(true)}
                className="w-full p-8 rounded-lg border-2 border-dashed border-border-default hover:border-accent-blue bg-bg-card hover:bg-bg-card-hover transition-colors duration-150 flex flex-col items-center gap-2"
              >
                <FileText className="w-8 h-8 text-text-muted" />
                <span className="text-sm text-text-secondary">اضغط لعرض الفاتورة</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment Status Badge */}
      <div className="mb-4">
        {invoice.payment_link ? (
          <Badge variant="info" icon={LinkIcon}>
            يحتوي رابط دفع
          </Badge>
        ) : (
          <Badge variant="default" icon={CreditCard}>
            دفع يدوي
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border-default">
        {/* PDF Button */}
        <button
          onClick={() => setIsPdfViewerOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary hover:bg-bg-secondary text-text-secondary text-sm transition-colors duration-150"
        >
          <FileText className="w-4 h-4" />
          <span>عرض PDF</span>
        </button>

        {/* Payment Link */}
        {invoice.payment_link && (
          <Link
            href={invoice.payment_link}
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green hover:bg-green-600 text-white text-sm transition-colors duration-150"
          >
            <DollarSign className="w-4 h-4" />
            <span>ادفع الآن</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}

        {/* Contact Vendor Button - Only for manual invoices */}
        {invoice.source === 'يدوي' && (
          <button
            onClick={handleContactVendor}
            disabled
            title="سيتم تفعيل هذه الميزة قريباً"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary text-text-muted text-sm cursor-not-allowed opacity-50"
          >
            <Mail className="w-4 h-4" />
            <span>تواصل مع المزود</span>
          </button>
        )}

        {/* Mark as Paid Button */}
        {canMarkAsPaid && (
          <>
            <Button
              variant="primary"
              onClick={() => setIsConfirmOpen(true)}
              className="flex items-center gap-2 ms-auto"
              disabled={markAsPaidMutation.isPending || markAsCancelledMutation.isPending}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{markAsPaidMutation.isPending ? 'جاري التحديث...' : 'تم الدفع'}</span>
            </Button>

            {/* Cancel Invoice Button */}
            <Button
              variant="danger"
              onClick={() => setIsCancelConfirmOpen(true)}
              className="flex items-center gap-2"
              disabled={markAsCancelledMutation.isPending || markAsPaidMutation.isPending}
            >
              <X className="w-4 h-4" />
              <span>{markAsCancelledMutation.isPending ? 'جاري الإلغاء...' : 'إلغاء'}</span>
            </Button>
          </>
        )}
      </div>

      {/* Confirm Modal - Mark as Paid */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleMarkAsPaid}
        title="تأكيد الدفع"
        message={`هل أنت متأكد أنك تريد تحديث حالة فاتورة ${invoice.vendor_name} إلى "مدفوعة"؟`}
        confirmText="نعم، تم الدفع"
        cancelText="إلغاء"
        isLoading={markAsPaidMutation.isPending}
      />

      {/* Confirm Modal - Cancel Invoice */}
      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancel}
        title="تأكيد إلغاء الفاتورة"
        message={`هل أنت متأكد أنك تريد إلغاء فاتورة ${invoice.vendor_name}؟ لن يمكنك التراجع عن هذا الإجراء.`}
        confirmText="نعم، إلغاء الفاتورة"
        cancelText="تراجع"
        isLoading={markAsCancelledMutation.isPending}
      />

      {/* PDF Viewer Modal */}
      <PDFViewer
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
        pdfUrl={invoice.pdf_url}
        title={`فاتورة ${invoice.vendor_name} - ${invoice.invoice_number}`}
      />
    </div>
  );
}
