import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware proxy cho Next.js.
 * Việc phân quyền Admin và Người dùng được quản lý trực tiếp và bảo mật bởi AuthContext
 * và các route page (như /admin), tránh việc redirect nhầm sang trang login khi người dùng đã đăng nhập.
 */
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

