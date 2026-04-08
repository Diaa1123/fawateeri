'use client';

import { useQuery } from '@tanstack/react-query';
import { Invoice } from '@/types/invoice';

interface MonthlyStats {
  month: string;
  paid: number;
  pending: number;
  cancelled: number;
}

interface Stats {
  totalPaidThisMonth: number;
  totalPending: number;
  newInvoicesCount: number; // عدد الفواتير الجديدة (حالة "جديدة")
  paidThisMonthCount: number; // عدد الفواتير المدفوعة في الشهر الحالي
  monthlyData: MonthlyStats[];
}

interface InvoicesResponse {
  success: boolean;
  data: {
    records: Invoice[];
  };
}

async function fetchStats(): Promise<Stats> {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    console.error('No auth token found');
    return {
      totalPaidThisMonth: 0,
      totalPending: 0,
      newInvoicesCount: 0,
      paidThisMonthCount: 0,
      monthlyData: [],
    };
  }

  try {
    // Fetch all invoices (no filter = get all)
    const response = await fetch('/api/invoices', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الفواتير');
    }

    const data: InvoicesResponse = await response.json();

    if (!data.success || !data.data?.records) {
      throw new Error('فشل في جلب الفواتير');
    }

    const invoices = data.data.records;

    // Calculate current month (YYYY-MM format)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Calculate stats
    const newInvoices = invoices.filter(inv => inv.status === 'جديدة');
    const paidInvoices = invoices.filter(inv => inv.status === 'مدفوعة');
    const cancelledInvoices = invoices.filter(inv => inv.status === 'ملغاة');

    // Filter paid invoices by current month using paid_at date
    const paidThisMonth = paidInvoices.filter(inv => {
      if (!inv.paid_at) return false;
      const paidDate = new Date(inv.paid_at);
      const paidMonth = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
      return paidMonth === currentMonth;
    });

    // Exchange rate: 1 USD = 3.75 SAR
    const USD_TO_SAR = 3.75;

    // Helper function to convert any currency to SAR
    const convertToSAR = (amount: number, currency: string): number => {
      const curr = currency?.toUpperCase() || 'SAR';
      if (curr === 'USD') {
        return amount * USD_TO_SAR;
      }
      // Add more currencies here if needed
      return amount; // Default: assume SAR
    };

    // Total pending (sum of all new invoices converted to SAR)
    const totalPending = newInvoices.reduce((sum, inv) => {
      const amount = inv.amount || 0;
      const currency = inv.currency || 'SAR';
      if (amount > 0) {
        return sum + convertToSAR(amount, currency);
      }
      return sum;
    }, 0);

    // Total paid this month (sum of invoices paid this month converted to SAR)
    const totalPaidThisMonth = paidThisMonth.reduce((sum, inv) => {
      const amount = inv.amount || 0;
      const currency = inv.currency || 'SAR';
      if (amount > 0) {
        return sum + convertToSAR(amount, currency);
      }
      return sum;
    }, 0);

    // Calculate monthly data for the last 6 months
    const monthlyData: MonthlyStats[] = [];
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = arabicMonths[date.getMonth()];

      // Paid invoices in this month (based on paid_at)
      const paidInMonth = paidInvoices.filter(inv => {
        if (!inv.paid_at) return false;
        const paidDate = new Date(inv.paid_at);
        const paidMonth = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
        return paidMonth === monthKey;
      });

      // New invoices in this month (based on invoice_date)
      const newInMonth = invoices.filter(inv => {
        if (!inv.invoice_date) return false;
        const invDate = new Date(inv.invoice_date);
        const invMonth = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
        return invMonth === monthKey && inv.status === 'جديدة';
      });

      // Cancelled invoices in this month (based on cancelled_at)
      const cancelledInMonth = cancelledInvoices.filter(inv => {
        if (!inv.cancelled_at) return false;
        const cancelledDate = new Date(inv.cancelled_at);
        const cancelledMonth = `${cancelledDate.getFullYear()}-${String(cancelledDate.getMonth() + 1).padStart(2, '0')}`;
        return cancelledMonth === monthKey;
      });

      monthlyData.push({
        month: monthName,
        paid: paidInMonth.reduce((sum, inv) => {
          const amount = inv.amount || 0;
          const currency = inv.currency || 'SAR';
          return amount > 0 ? sum + convertToSAR(amount, currency) : sum;
        }, 0),
        pending: newInMonth.reduce((sum, inv) => {
          const amount = inv.amount || 0;
          const currency = inv.currency || 'SAR';
          return amount > 0 ? sum + convertToSAR(amount, currency) : sum;
        }, 0),
        cancelled: cancelledInMonth.reduce((sum, inv) => {
          const amount = inv.amount || 0;
          const currency = inv.currency || 'SAR';
          return amount > 0 ? sum + convertToSAR(amount, currency) : sum;
        }, 0),
      });
    }

    return {
      totalPaidThisMonth,
      totalPending,
      newInvoicesCount: newInvoices.length,
      paidThisMonthCount: paidThisMonth.length,
      monthlyData,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalPaidThisMonth: 0,
      totalPending: 0,
      newInvoicesCount: 0,
      paidThisMonthCount: 0,
      monthlyData: [],
    };
  }
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 30 * 1000, // 30 seconds
  });
}
