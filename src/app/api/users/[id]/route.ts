import { NextResponse } from 'next/server';
import { getRecord, updateRecord } from '@/lib/airtable';
import { hashPassword } from '@/lib/auth';
import { User } from '@/types/user';
import { ApiResponse } from '@/types/api';
import { updateUserSchema } from '@/lib/validations';

/**
 * GET /api/users/[id] - Get a single user (admin only)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check role
    const role = request.headers.get('x-user-role');

    if (role !== 'admin') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'غير مصرح. هذه الصفحة للأدمن فقط' },
        { status: 403 }
      );
    }

    // 2. Get user from Airtable
    const { id } = await params;
    const user = await getRecord<User>('Users', id);

    // 3. Remove password_hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    // 4. Return user
    return NextResponse.json<ApiResponse<typeof userWithoutPassword>>({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'حدث خطأ أثناء جلب المستخدم' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id] - Update a user (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check role
    const role = request.headers.get('x-user-role');

    if (role !== 'admin') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'غير مصرح. هذه الصفحة للأدمن فقط' },
        { status: 403 }
      );
    }

    // 2. Parse body
    const body = await request.json();

    // 3. Validate inputs
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'بيانات غير صحيحة';
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // 4. Update user in Airtable
    const { id } = await params;
    const updateData: Partial<User> = { ...validation.data };

    // If password is provided, hash it and save plain version
    if (updateData.password && updateData.password.trim() !== '') {
      updateData.password_hash = await hashPassword(updateData.password);
      // Keep plain password for admin to see
    } else {
      // Remove empty password field
      delete updateData.password;
    }

    const updatedUser = await updateRecord<User>('Users', id, updateData);

    // 5. Remove password_hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json<ApiResponse<typeof userWithoutPassword>>({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'حدث خطأ أثناء تحديث المستخدم' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id] - Disable a user (soft delete, admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check role
    const role = request.headers.get('x-user-role');

    if (role !== 'admin') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'غير مصرح. هذه الصفحة للأدمن فقط' },
        { status: 403 }
      );
    }

    // 2. Soft delete: Update is_active to false
    const { id } = await params;
    await updateRecord<User>('Users', id, { is_active: false });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'حدث خطأ أثناء تعطيل المستخدم' },
      { status: 500 }
    );
  }
}
