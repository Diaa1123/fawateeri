import { NextResponse } from 'next/server';
import { listRecords, createRecord } from '@/lib/airtable';
import { hashPassword } from '@/lib/auth';
import { User } from '@/types/user';
import { ApiResponse } from '@/types/api';
import { createUserSchema } from '@/lib/validations';

/**
 * GET /api/users - Get all users (admin only)
 */
export async function GET(request: Request) {
  try {
    // 1. Check role (middleware already checked, but double-check)
    const role = request.headers.get('x-user-role');

    if (role !== 'admin') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'غير مصرح. هذه الصفحة للأدمن فقط' },
        { status: 403 }
      );
    }

    // 2. Get all users from Airtable
    const result = await listRecords<User>('Users', {});

    // 3. Remove password_hash from results (keep password for admin)
    const users = result.records.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...userWithoutHash } = user;
      return userWithoutHash;
    });

    // 4. Return users
    return NextResponse.json<ApiResponse<typeof users>>({
      success: true,
      data: users,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب المستخدمين',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Create a new user (admin only)
 */
export async function POST(request: Request) {
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
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'بيانات غير صحيحة';
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    const { username, display_name, password, role: userRole } = validation.data;

    // 4. Check if username already exists
    const existingUsers = await listRecords<User>('Users', {
      filterByFormula: `{username} = '${username}'`,
      maxRecords: 1,
    });

    if (existingUsers.records.length > 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'اسم المستخدم مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // 5. Hash password
    const password_hash = await hashPassword(password);

    // 6. Create user in Airtable
    const newUser = await createRecord<User>('Users', {
      username,
      display_name,
      password_hash,
      password, // حفظ كلمة السر بنص عادي للأدمن
      role: userRole,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    });

    // 7. Remove password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json<ApiResponse<typeof userWithoutPassword>>(
      {
        success: true,
        data: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء المستخدم',
      },
      { status: 500 }
    );
  }
}
