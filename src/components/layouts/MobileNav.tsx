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
    label: 'التقرير',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'viewer'],
  },
  {
    label: 'الفواتير',
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
    label: 'إضافة',
    href: '/add',
    icon: Plus,
    roles: ['admin', 'viewer', 'team'],
  },
  {
    label: 'المستخدمين',
    href: '/users',
    icon: Users,
    roles: ['admin'],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter nav items based on user role
  const visibleItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-bg-sidebar border-t border-border-default z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                transition-colors duration-150 min-w-[64px]
                ${
                  isActive
                    ? 'text-accent-blue'
                    : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
