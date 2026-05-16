import { getTokenByRole, RoleType } from "./auth";

export const BASE_URL = "http://localhost:8080";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  role?: RoleType
) {
  // 1. Kiểm tra xem phía giao diện (options.headers) đã tự truyền Token vào chưa
  const incomingHeaders = (options.headers as Record<string, string>) || {};
  
  // Tìm xem có header Authorization nào được truyền thủ công không (chấp nhận cả viết hoa viết thường)
  const hasAuthHeader = Object.keys(incomingHeaders).some(
    key => key.toLowerCase() === 'authorization'
  );

  let headers: Record<string, string> = {};

  if (hasAuthHeader) {
    // Nếu giao diện đã truyền Token (như token_admin trong trang chi tiết), giữ nguyên hoàn toàn quyền đó
    headers = { ...incomingHeaders };
  } else {
    // Nếu giao diện KHÔNG truyền, lúc này mới tự động quét fallback từ localStorage
    const autoToken = localStorage.getItem('token_admin') || localStorage.getItem('token_user') || localStorage.getItem('token');
    headers = {
      ...(autoToken ? { Authorization: `Bearer ${autoToken}` } : {}),
      ...incomingHeaders,
    };
  }

  // 2. Tự động thêm Content-Type nếu dữ liệu gửi lên không phải là FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * FIX: Hàm lấy ảnh chuẩn cho cả Cloudinary và Local Storage
 */
export const getImageUrl = (path: string | null | undefined) => {
  if (!path) {
    return "https://placehold.co/400x600?text=No+Poster";
  }

  if (path.startsWith("http")) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/uploads/movies/${cleanPath}`;
};