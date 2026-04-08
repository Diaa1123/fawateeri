'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AddInvoicePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');

      const payload = {
        ...data,
        _source: 'vendors', // Save to Vendors table
        uploaded_by: user?.display_name || user?.username,
        uploaded_at: new Date().toISOString().split('T')[0],
        source: 'يدوي',
        status: 'جديدة',
      };

      console.log('Sending invoice data:', payload);

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'فشل حفظ الفاتورة';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
          errorMessage = `خطأ في الخادم (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      setShowSuccess(true);

      // Redirect based on user role
      setTimeout(() => {
        if (user?.role === 'team') {
          // Team users stay on the page and reset form
          setShowSuccess(false);
          window.location.reload();
        } else {
          // Admin and viewer go to invoices page
          router.push('/invoices');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert(error.message || 'حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with logout for team users */}
      {user?.role === 'team' && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              مرحباً، {user.display_name || user.username}
            </h1>
            <p className="text-sm text-text-muted">فريق العمل</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        إضافة فاتورة جديدة
      </h1>
      <p className="text-text-secondary mb-6">
        قم برفع ملف PDF واستخدم التحليل الذكي لتعبئة الحقول تلقائياً
      </p>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-accent-green" />
            <div>
              <p className="text-accent-green font-semibold">تم حفظ الفاتورة بنجاح!</p>
              <p className="text-text-secondary text-sm mt-1">
                {user?.role === 'team'
                  ? 'جاري تحميل نموذج جديد...'
                  : 'جاري التحويل إلى صفحة الفواتير...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-bg-card border border-border-default rounded-xl p-8">
        <InvoiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
