'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';
import { MobileNav } from '@/components/layouts/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const isTeam = user?.role === 'team';

  // Team users: Simple layout without sidebar/header
  if (isTeam) {
    const handleLogout = () => {
      localStorage.removeItem('auth_token');
      router.push('/login');
    };

    return (
      <div className="min-h-screen bg-bg-primary">
        {/* Simple Header for Team with Logout Button */}
        <div className="border-b border-border-default bg-bg-card p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-text-primary">فواتيري</h1>
              <p className="text-sm text-text-muted">مرحباً، {user?.display_name || user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-bg-primary hover:bg-bg-secondary text-text-secondary text-sm transition-colors duration-150"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    );
  }

  // Admin/Viewer: Full layout with sidebar and header
  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation - Mobile only */}
      <MobileNav />
    </div>
  );
}
