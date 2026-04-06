'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-bg-card border-b border-border-default sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Page Title - يمكن تخصيصه لاحقاً */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
            <User className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-text-secondary">
              مرحباً،
            </h2>
            <p className="text-base font-semibold text-text-primary">
              {user?.displayName || user?.username || 'مستخدم'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* User Role Badge */}
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-bg-primary border border-border-default">
            <span className="text-xs font-medium text-text-secondary">
              {user?.role === 'admin' && 'مدير النظام'}
              {user?.role === 'viewer' && 'مشاهد'}
              {user?.role === 'team' && 'فريق العمل'}
            </span>
          </div>

          {/* Logout Button */}
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
