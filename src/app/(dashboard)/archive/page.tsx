'use client';

import { useState, useMemo } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceTable } from '@/components/shared/InvoiceTable';
import { InvoiceCard } from '@/components/shared/InvoiceCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatsCard } from '@/components/shared/StatsCard';
import { Archive, DollarSign, FileText, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

type ArchiveStatus = 'all' | 'paid' | 'cancelled';

export default function ArchivePage() {
  // Set default to current month
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // Default: All Time
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArchiveStatus>('all');

  // Fetch both paid and cancelled invoices for selected month
  const { data: paidInvoices, isLoading: isLoadingPaid } = useInvoices('مدفوعة', selectedMonth === 'all' ? undefined : selectedMonth);
  const { data: cancelledInvoices, isLoading: isLoadingCancelled } = useInvoices('ملغاة', selectedMonth === 'all' ? undefined : selectedMonth);

  const isLoading = isLoadingPaid || isLoadingCancelled;

  // Combine invoices based on status filter
  const allInvoices = useMemo(() => {
    const paid = paidInvoices || [];
    const cancelled = cancelledInvoices || [];

    if (statusFilter === 'paid') return paid;
    if (statusFilter === 'cancelled') return cancelled;
    return [...paid, ...cancelled].sort((a, b) =>
      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }, [paidInvoices, cancelledInvoices, statusFilter]);

  // Generate last 12 months
  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      result.push(monthYear);
    }
    return result;
  }, []);

  // Filter invoices by search query
  const filteredInvoices = useMemo(() => {
    if (!allInvoices) return [];
    if (!searchQuery) return allInvoices;

    const query = searchQuery.toLowerCase();
    return allInvoices.filter(
      (inv) =>
        (inv.vendor_name?.toString().toLowerCase() || '').includes(query) ||
        (inv.invoice_number?.toString().toLowerCase() || '').includes(query)
    );
  }, [allInvoices, searchQuery]);

  // Calculate stats from displayed data (after filters)
  const stats = useMemo(() => {
    const paid = filteredInvoices.filter(inv => inv.status === 'مدفوعة');
    const cancelled = filteredInvoices.filter(inv => inv.status === 'ملغاة');

    return {
      totalPaid: paid.reduce((sum, inv) => sum + inv.amount, 0),
      paidCount: paid.length,
      totalCancelled: cancelled.reduce((sum, inv) => sum + inv.amount, 0),
      cancelledCount: cancelled.length,
    };
  }, [filteredInvoices]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          أرشيف الفواتير
        </h1>
        <p className="text-text-secondary">
          الفواتير المدفوعة والملغاة
        </p>
      </div>

      {/* Stats Cards - 4 cards in 2 rows */}
      <div className="space-y-6">
        {/* Row 1: Paid Invoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="إجمالي المدفوع"
            value={formatCurrency(stats.totalPaid)}
            icon={DollarSign}
            iconColor="text-accent-green"
            iconBg="bg-accent-green/10"
          />
          <StatsCard
            title="عدد الفواتير المدفوعة"
            value={stats.paidCount.toString()}
            icon={FileText}
            iconColor="text-accent-green"
            iconBg="bg-accent-green/10"
          />
        </div>

        {/* Row 2: Cancelled Invoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="إجمالي الملغاة"
            value={formatCurrency(stats.totalCancelled)}
            icon={DollarSign}
            iconColor="text-accent-red"
            iconBg="bg-accent-red/10"
          />
          <StatsCard
            title="عدد الفواتير الملغاة"
            value={stats.cancelledCount.toString()}
            icon={XCircle}
            iconColor="text-accent-red"
            iconBg="bg-accent-red/10"
          />
        </div>
      </div>

      {/* Filters - Single Row */}
      <div className="bg-bg-card border border-border-default rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium text-text-primary mb-2 block">
              حالة الفاتورة
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${
                  statusFilter === 'all'
                    ? 'bg-accent-blue text-white'
                    : 'bg-bg-primary border border-border-default text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${
                  statusFilter === 'paid'
                    ? 'bg-accent-green text-white'
                    : 'bg-bg-primary border border-border-default text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                مدفوعة
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${
                  statusFilter === 'cancelled'
                    ? 'bg-accent-red text-white'
                    : 'bg-bg-primary border border-border-default text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                ملغاة
              </button>
            </div>
          </div>

          {/* Month Selector - Dropdown */}
          <div className="flex-shrink-0">
            <label htmlFor="month-filter" className="text-sm font-medium text-text-primary mb-2 block">
              الفترة الزمنية
            </label>
            <select
              id="month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-lg bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-blue transition-colors duration-150"
            >
              <option value="all">All Time</option>
              {months.map((month) => {
                const [year, monthNum] = month.split('-');
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                return (
                  <option key={month} value={month}>
                    {monthName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search */}
          <div className="flex-shrink-0">
            <label className="text-sm font-medium text-text-primary mb-2 block">
              بحث
            </label>
            <Input
              type="text"
              placeholder="بحث بالمورد أو رقم الفاتورة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Invoices */}
      {filteredInvoices && filteredInvoices.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-bg-card border border-border-default rounded-xl overflow-hidden">
            <InvoiceTable invoices={filteredInvoices} />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Archive}
          title="لا توجد فواتير"
          description={
            searchQuery
              ? 'لم يتم العثور على فواتير تطابق البحث'
              : selectedMonth
              ? 'لا توجد فواتير في هذا الشهر'
              : 'لا توجد فواتير في الأرشيف بعد'
          }
        />
      )}
    </div>
  );
}
