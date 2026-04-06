'use client';

import { useQuery } from '@tanstack/react-query';
import { Invoice } from '@/types/invoice';

interface InvoicesResponse {
  success: boolean;
  invoices: Invoice[];
  error?: string;
}

async function fetchInvoices(status?: string, monthYear?: string): Promise<Invoice[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (monthYear) params.append('month_year', monthYear);

    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.error('No auth token found');
      return [];
    }

    const response = await fetch(`/api/invoices?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Response not OK:', response.status);
      throw new Error('فشل في جلب الفواتير');
    }

    const data = await response.json();

    if (!data.success) {
      console.error('API error:', data.error);
      throw new Error(data.error || 'فشل في جلب الفواتير');
    }

    return data.data?.records || [];
  } catch (error) {
    console.error('fetchInvoices error:', error);
    throw error;
  }
}

export function useInvoices(status?: string, monthYear?: string) {
  return useQuery({
    queryKey: ['invoices', status, monthYear],
    queryFn: () => fetchInvoices(status, monthYear),
    staleTime: 30 * 1000, // 30 seconds
  });
}
