'use client';

import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceCard } from '@/components/shared/InvoiceCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

export default function InvoicesPage() {
  const { data: invoices, isLoading, error } = useInvoices('جديدة');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-6 text-center">
        <p className="text-accent-red">حدث خطأ أثناء جلب الفواتير</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        الفواتير الجديدة
      </h1>
      <p className="text-text-secondary mb-6">
        قائمة الفواتير التي لم يتم دفعها بعد
      </p>

      {/* Invoices List */}
      {invoices && invoices.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} showMarkAsPaid={true} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="لا توجد فواتير جديدة"
          description="جميع الفواتير تم دفعها أو لم يتم إضافة فواتير جديدة بعد"
        />
      )}
    </div>
  );
}
