import { NextResponse } from 'next/server';
import { getUserByUsername, comparePassword, signToken } from '@/lib/auth';
import { ApiResponse } from '@/types/api';

export async function POST(request: Request) {
  try {
    // 1. Parse body
    const body = await request.json();
    const { username, password } = body;

    // 2. Validate inputs
    if (!username || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'اسم المستخدم وكلمة السر مطلوبان' },
        { status: 400 }
      );
    }

    // 3. Get user from Airtable
    const user = await getUserByUsername(username);

    // 4. Check if user exists
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'اسم المستخدم أو كلمة السر غير صحيحة' },
        { status: 401 }
      );
    }

    // 5. Check if user is active
    if (!user.is_active) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'هذا الحساب معطّل. الرجاء التواصل مع المسؤول' },
        { status: 403 }
      );
    }

    // 6. Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'اسم المستخدم أو كلمة السر غير صحيحة' },
        { status: 401 }
      );
    }

    // 7. Sign JWT token
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // 8. Return success response
    return NextResponse.json({
      success: true,
      token,
      user: {
        username: user.username,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى',
      },
      { status: 500 }
    );
  }
}
