'use client';

import { User } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Edit, Power, PowerOff } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export function UserTable({ users, onEdit, onToggleStatus }: UserTableProps) {
  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'مدير النظام',
      viewer: 'مشاهد',
      team: 'فريق العمل',
    };
    return roles[role] || role;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              اسم المستخدم
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              الاسم المعروض
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              كلمة السر
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              الدور
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              الحالة
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-text-secondary">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              className={`border-b border-border-default/50 hover:bg-bg-card-hover transition-colors duration-150
                ${index % 2 === 0 ? 'bg-bg-card/30' : 'bg-transparent'}`}
            >
              <td className="px-4 py-4 text-text-primary">{user.username}</td>
              <td className="px-4 py-4 text-text-primary">{user.display_name}</td>
              <td className="px-4 py-4">
                <code className="px-2 py-1 bg-bg-primary rounded text-accent-green text-sm font-mono">
                  {user.password || '******'}
                </code>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                    ${user.role === 'admin' ? 'bg-accent-purple/10 text-accent-purple' : ''}
                    ${user.role === 'viewer' ? 'bg-accent-blue/10 text-accent-blue' : ''}
                    ${user.role === 'team' ? 'bg-accent-amber/10 text-accent-amber' : ''}`}
                >
                  {getRoleName(user.role)}
                </span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                    ${user.is_active ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}
                >
                  {user.is_active ? (
                    <>
                      <Power className="w-3 h-3" />
                      <span>فعّال</span>
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-3 h-3" />
                      <span>معطّل</span>
                    </>
                  )}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(user)}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل</span>
                  </Button>
                  <Button
                    variant={user.is_active ? 'danger' : 'primary'}
                    onClick={() => onToggleStatus(user)}
                    className="flex items-center gap-2 text-sm"
                  >
                    {user.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        <span>تعطيل</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        <span>تفعيل</span>
                      </>
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
