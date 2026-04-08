'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/shared/StatsCard';
import { ActivityLog } from '@/components/shared/ActivityLog';
import { MonthlyChart } from '@/components/shared/MonthlyChart';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, Clock, FileText, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useStats();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  // Redirect team users to /add page
  useEffect(() => {
    if (user && user.role === 'team') {
      router.replace('/add');
    }
  }, [user, router]);

  // Don't render dashboard for team users - show loading instead
  if (isLoading || (user && user.role === 'team')) {
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
        <p className="text-accent-red">حدث خطأ أثناء جلب الإحصائيات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          التقرير الشامل
        </h1>
        <p className="text-text-secondary">
          عرض شامل لحالة الفواتير والإحصائيات
        </p>
      </div>

      {/* Row 1: Two Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="فواتير جديدة"
          value={formatNumber(stats?.newInvoicesCount || 0)}
          icon={FileText}
          iconColor="text-accent-red"
          iconBg="bg-accent-red/10"
        />
        <StatsCard
          title="إجمالي المعلق"
          value={formatCurrency(stats?.totalPending || 0)}
          icon={Clock}
          iconColor="text-accent-amber"
          iconBg="bg-accent-amber/10"
        />
      </div>

      {/* Row 2: Monthly Stats (Expanded) */}
      <div className="bg-bg-card border border-border-default rounded-xl p-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-bg-primary">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <p className="text-sm text-text-muted">إجمالي المدفوع</p>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(stats?.totalPaidThisMonth || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-bg-primary">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-sm text-text-muted">عدد الفواتير المدفوعة هذا الشهر</p>
              <p className="text-xl font-bold text-text-primary">
                {formatNumber(stats?.paidThisMonthCount || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="border-t border-border-default pt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            الإحصائيات الشهرية (آخر 6 أشهر)
          </h2>
          {stats?.monthlyData && stats.monthlyData.length > 0 ? (
            <MonthlyChart data={stats.monthlyData} />
          ) : (
            <div className="text-center py-12 text-text-muted">
              لا توجد بيانات كافية لعرض الرسم البياني
            </div>
          )}
        </div>

        {/* Admin Only: Icon Reorder Button */}
        {user?.role === 'admin' && (
          <div className="border-t border-border-default pt-4 mt-6">
            <button
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
              onClick={() => alert('سيتم تفعيل هذه الميزة قريباً')}
            >
              ⚙️ تعديل ترتيب الأيقونات
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Activity Log - Moved to bottom */}
      <ActivityLog />
    </div>
  );
}
