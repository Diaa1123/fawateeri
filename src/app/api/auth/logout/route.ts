import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

export async function POST() {
  try {
    const response = NextResponse.json<ApiResponse<null>>({
      success: true,
    });

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'حدث خطأ أثناء تسجيل الخروج',
      },
      { status: 500 }
    );
  }
}
