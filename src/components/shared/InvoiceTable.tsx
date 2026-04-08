import Link from 'next/link';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { FileText, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const queryClient = useQueryClient();
  const [confirmRevert, setConfirmRevert] = useState<string | null>(null);

  const revertToNewMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'جديدة' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في إرجاع الفاتورة');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setConfirmRevert(null);
    },
  });

  const handleRevert = (invoiceId: string) => {
    if (confirmRevert === invoiceId) {
      revertToNewMutation.mutate(invoiceId);
    } else {
      setConfirmRevert(invoiceId);
      setTimeout(() => setConfirmRevert(null), 3000);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              الحالة
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              المورد
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              المبلغ
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              تاريخ الفاتورة
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              تاريخ الدفع
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              من دفع
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              PDF
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr
              key={invoice.id}
              className={`
                border-b border-border-default
                hover:bg-bg-card-hover transition-colors duration-150
                ${index % 2 === 0 ? 'bg-bg-card/30' : 'bg-transparent'}
              `}
            >
              <td className="px-4 py-3">
                {invoice.status === 'مدفوعة' ? (
                  <Badge variant="success">مدفوعة</Badge>
                ) : invoice.status === 'ملغاة' ? (
                  <Badge variant="danger">ملغاة</Badge>
                ) : (
                  <Badge variant="warning">جديدة</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-text-primary">{invoice.vendor_name}</p>
                  <p className="text-xs text-text-muted">#{invoice.invoice_number}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-text-primary font-medium">
                {formatCurrency(invoice.amount, invoice.currency)}
              </td>
              <td className="px-4 py-3 text-text-secondary text-sm">
                {formatDateShort(invoice.invoice_date)}
              </td>
              <td className="px-4 py-3 text-text-secondary text-sm">
                {invoice.paid_at ? formatDateShort(invoice.paid_at) : '-'}
              </td>
              <td className="px-4 py-3 text-text-secondary text-sm">
                {invoice.paid_by || '-'}
              </td>
              <td className="px-4 py-3">
                {invoice.pdf_url ? (
                  <a
                    href={invoice.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-primary hover:bg-bg-secondary text-text-secondary text-sm transition-colors duration-150"
                  >
                    <FileText className="w-4 h-4" />
                    <span>عرض</span>
                  </a>
                ) : (
                  <span className="text-text-muted text-sm">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleRevert(invoice.id)}
                  disabled={revertToNewMutation.isPending && confirmRevert === invoice.id}
                  className={`
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150
                    ${
                      confirmRevert === invoice.id
                        ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30'
                        : 'bg-bg-primary hover:bg-bg-secondary text-text-secondary border border-border-default'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    {confirmRevert === invoice.id
                      ? 'أكد الإرجاع'
                      : 'إرجاع إلى جديدة'}
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
