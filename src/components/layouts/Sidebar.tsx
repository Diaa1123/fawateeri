'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Archive,
  Plus,
  Users,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'viewer' | 'team')[];
}

const navItems: NavItem[] = [
  {
    label: 'التقرير الشامل',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'viewer'],
  },
  {
    label: 'الفواتير الجديدة',
    href: '/invoices',
    icon: FileText,
    roles: ['admin', 'viewer'],
  },
  {
    label: 'الأرشيف',
    href: '/archive',
    icon: Archive,
    roles: ['admin', 'viewer'],
  },
  {
    label: 'إضافة فاتورة',
    href: '/add',
    icon: Plus,
    roles: ['admin', 'viewer', 'team'],
  },
  {
    label: 'إدارة المستخدمين',
    href: '/users',
    icon: Users,
    roles: ['admin'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter nav items based on user role
  const visibleItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <aside className="hidden md:flex md:flex-col md:w-[260px] bg-bg-sidebar border-s border-border-default h-screen sticky top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border-default">
        <h1 className="text-2xl font-bold text-text-primary">فواتيري</h1>
        <p className="text-sm text-text-muted mt-1">نظام إدارة الفواتير</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-150
                ${
                  isActive
                    ? 'bg-accent-blue text-white'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-default">
        <div className="text-xs text-text-muted text-center">
          نظام داخلي
        </div>
      </div>
    </aside>
  );
}
