'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';
import { FileText, Loader, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'new' | 'paid' | 'cancelled' | 'reverted';
  invoice: Invoice;
  timestamp: Date;
  message: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

// Fetch all invoices (no status filter)
async function fetchAllInvoices(): Promise<Invoice[]> {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return [];

    const response = await fetch('/api/invoices', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data?.records || [];
  } catch (error) {
    console.error('Error fetching invoices for activity log:', error);
    return [];
  }
}

// Format relative time in Arabic
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
}

export function ActivityLog() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['activity-log'],
    queryFn: fetchAllInvoices,
    staleTime: 30 * 1000,
  });

  // Generate activity events from invoices
  const events: ActivityEvent[] = useMemo(() => {
    if (!invoices) return [];

    const allEvents: ActivityEvent[] = [];

    invoices.forEach((invoice) => {
      // Skip invalid invoices
      if (!invoice.vendor_name || invoice.amount == null) return;

      // New invoice event
      if (invoice.uploaded_at) {
        allEvents.push({
          id: `new-${invoice.id}`,
          type: 'new',
          invoice,
          timestamp: new Date(invoice.uploaded_at),
          message: `فاتورة جديدة من "${invoice.vendor_name}" بقيمة ${formatCurrency(invoice.amount, invoice.currency)}`,
          icon: FileText,
          iconColor: 'text-accent-blue',
          iconBg: 'bg-accent-blue/10',
        });
      }

      // Paid event
      if (invoice.status === 'مدفوعة' && invoice.paid_at) {
        allEvents.push({
          id: `paid-${invoice.id}`,
          type: 'paid',
          invoice,
          timestamp: new Date(invoice.paid_at),
          message: `تم دفع فاتورة #${invoice.invoice_number || 'غير معروف'} من "${invoice.vendor_name}" بواسطة ${invoice.paid_by || 'غير معروف'}`,
          icon: CheckCircle,
          iconColor: 'text-accent-green',
          iconBg: 'bg-accent-green/10',
        });
      }

      // Cancelled event
      if (invoice.status === 'ملغاة') {
        const cancelledDate = invoice.cancelled_at || invoice.uploaded_at;
        if (cancelledDate) {
          allEvents.push({
            id: `cancelled-${invoice.id}`,
            type: 'cancelled',
            invoice,
            timestamp: new Date(cancelledDate),
            message: `تم إلغاء فاتورة #${invoice.invoice_number || 'غير معروف'} من "${invoice.vendor_name}"`,
            icon: XCircle,
            iconColor: 'text-accent-red',
            iconBg: 'bg-accent-red/10',
          });
        }
      }

      // TODO: Reverted event - requires tracking when invoice status changes from paid/cancelled back to new
      // This would need additional fields in Airtable (reverted_at, reverted_by)
    });

    // Sort by timestamp (newest first)
    return allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10); // Show last 10 events
  }, [invoices]);

  if (isLoading) {
    return (
      <div className="bg-bg-card border border-border-default rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          سجل النظام
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-text-muted animate-spin" />
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-bg-card border border-border-default rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          سجل النظام
        </h2>
        <p className="text-text-muted text-center py-8">
          لا توجد أحداث بعد
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        سجل النظام
      </h2>
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary hover:bg-bg-secondary transition-colors duration-150"
            >
              <div className={`w-8 h-8 rounded-lg ${event.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${event.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  {event.message}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
