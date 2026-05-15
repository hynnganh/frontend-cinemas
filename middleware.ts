import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lấy Token từ Cookies (Middleware chạy ở Edge Runtime nên chỉ đọc được Cookies)
  const tokenSuper = request.cookies.get("token_super_admin")?.value;
  const tokenAdmin = request.cookies.get("token_admin")?.value;
  const tokenUser = request.cookies.get("token_user")?.value;

  // 2. Xử lý logic cho SUPER ADMIN
  if (pathname.startsWith("/super-admin")) {
    if (!tokenSuper) {
      // Nếu không có token Super, đá về trang login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Xử lý logic cho ADMIN thường
  if (pathname.startsWith("/admin")) {
    // Ưu tiên: Nếu có token Admin hoặc token Super (Super có quyền vào Admin) thì cho qua
    if (!tokenAdmin && !tokenSuper) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 4. Xử lý vùng USER (Profile, Vouchers, Booking)
  const isUserPath = pathname.startsWith("/profile") || 
                     pathname.startsWith("/my-vouchers") || 
                     pathname.startsWith("/checkout");

  if (isUserPath) {
    if (!tokenUser) {
      // Nếu là khách vãng lai cố vào xem profile thì đẩy về login của user
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 5. Ngăn chặn quay lại trang Login khi đã có Token (Tùy chọn nhưng nên có)
  // Ví dụ: Nếu đã có tokenAdmin mà còn vào /login thì đẩy thẳng vào /admin
  if (pathname === "/login") {
    if (tokenSuper) return NextResponse.redirect(new URL("/super-admin", request.url));
    if (tokenAdmin) return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// Config này giúp Middleware không chạy vào các file tĩnh (ảnh, favicon, v.v.)
export const config = {
  matcher: [
    "/admin/:path*", 
    "/super-admin/:path*", 
    "/profile/:path*", 
    "/my-vouchers/:path*",
    "/login" // Thêm login vào để xử lý redirect ngược
  ],
};