'use client';

import { useQuery } from '@tanstack/react-query';
import { Invoice } from '@/types/invoice';

interface MonthlyStats {
  month: string;
  paid: number;
  pending: number;
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

    // Filter paid invoices by current month using paid_at date
    const paidThisMonth = paidInvoices.filter(inv => {
      if (!inv.paid_at) return false;
      const paidDate = new Date(inv.paid_at);
      const paidMonth = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
      return paidMonth === currentMonth;
    });

    // Total pending (sum of all new invoices)
    const totalPending = newInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Total paid this month (sum of invoices paid this month only)
    const totalPaidThisMonth = paidThisMonth.reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalPaidThisMonth,
      totalPending,
      newInvoicesCount: newInvoices.length,
      paidThisMonthCount: paidThisMonth.length,
      monthlyData: [],
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
