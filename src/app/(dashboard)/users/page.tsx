'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types/user';
import { UserTable } from '@/components/shared/UserTable';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  display_name: z.string().min(2, 'الاسم المعروض يجب أن يكون حرفين على الأقل'),
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['admin', 'viewer', 'team']),
});

const editUserSchema = z.object({
  display_name: z.string().min(2, 'الاسم المعروض يجب أن يكون حرفين على الأقل'),
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل').optional().or(z.literal('')),
  role: z.enum(['admin', 'viewer', 'team']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('فشل جلب المستخدمين');
      const data = await response.json();
      return data.data as User[];
    },
  });

  // Create user form
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'team' },
  });

  // Edit user form
  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء المستخدم');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateModalOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditUserFormData }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث المستخدم');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (user: User) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث حالة المستخدم');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsConfirmToggleOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.setValue('display_name', user.display_name);
    editForm.setValue('role', user.role as 'admin' | 'viewer' | 'team');
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setIsConfirmToggleOpen(true);
  };

  const onCreateSubmit = (data: CreateUserFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: EditUserFormData) => {
    if (!selectedUser) return;
    updateMutation.mutate({ id: selectedUser.id, data });
  };

  const roleOptions = [
    { value: 'admin', label: 'مدير النظام' },
    { value: 'viewer', label: 'مشاهد' },
    { value: 'team', label: 'فريق العمل' },
  ];

  if (isLoading) {
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
        <AlertCircle className="w-12 h-12 text-accent-red mx-auto mb-4" />
        <p className="text-accent-red">حدث خطأ أثناء جلب المستخدمين</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            إدارة المستخدمين
          </h1>
          <p className="text-text-secondary">
            إضافة وتعديل وإدارة مستخدمي النظام
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>إضافة مستخدم</span>
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
        {users && users.length > 0 ? (
          <UserTable
            users={users}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="p-12 text-center">
            <p className="text-text-secondary">لا يوجد مستخدمون</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="إضافة مستخدم جديد"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={createForm.handleSubmit(onCreateSubmit)}
              isLoading={createMutation.isPending}
            >
              إنشاء المستخدم
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label="اسم المستخدم *"
            {...createForm.register('username')}
            error={createForm.formState.errors.username?.message}
            placeholder="مثال: ahmed.ali"
          />
          <Input
            label="الاسم المعروض *"
            {...createForm.register('display_name')}
            error={createForm.formState.errors.display_name?.message}
            placeholder="مثال: أحمد علي"
          />
          <Input
            label="كلمة السر *"
            type="password"
            {...createForm.register('password')}
            error={createForm.formState.errors.password?.message}
            placeholder="أدخل كلمة سر قوية"
          />
          <Select
            label="الدور *"
            {...createForm.register('role')}
            options={roleOptions}
            error={createForm.formState.errors.role?.message}
          />
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل المستخدم"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={updateMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={editForm.handleSubmit(onEditSubmit)}
              isLoading={updateMutation.isPending}
            >
              حفظ التغييرات
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label="الاسم المعروض *"
            {...editForm.register('display_name')}
            error={editForm.formState.errors.display_name?.message}
          />
          <Input
            label="كلمة السر الجديدة (اختياري)"
            type="password"
            {...editForm.register('password')}
            error={editForm.formState.errors.password?.message}
            placeholder="اتركه فارغاً إذا لا تريد التغيير"
          />
          <Select
            label="الدور *"
            {...editForm.register('role')}
            options={roleOptions}
            error={editForm.formState.errors.role?.message}
          />
        </form>
      </Modal>

      {/* Toggle Status Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmToggleOpen}
        onClose={() => setIsConfirmToggleOpen(false)}
        onConfirm={() => selectedUser && toggleStatusMutation.mutate(selectedUser)}
        title={selectedUser?.is_active ? 'تعطيل المستخدم' : 'تفعيل المستخدم'}
        message={
          selectedUser?.is_active
            ? `هل أنت متأكد أنك تريد تعطيل المستخدم "${selectedUser?.display_name}"؟`
            : `هل أنت متأكد أنك تريد تفعيل المستخدم "${selectedUser?.display_name}"؟`
        }
        confirmText={selectedUser?.is_active ? 'نعم، تعطيل' : 'نعم، تفعيل'}
        cancelText="إلغاء"
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
}
