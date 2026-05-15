export const BASE_URL = "http://localhost:8080";

import { getTokenByRole, RoleType } from "./auth";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  role?: RoleType
) {
  const token = getTokenByRole(role);

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const safeEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return fetch(`${BASE_URL}${safeEndpoint}`, {
    ...options,
    headers,
  });
}

/**
 * FIX: Hàm lấy ảnh chuẩn cho cả Cloudinary và Local Storage
 */
export const getImageUrl = (path: string | null | undefined) => {
  // 1. Nếu không có path, trả về ảnh placeholder
  if (!path) {
    return "https://placehold.co/400x600?text=No+Poster";
  }

  // 2. Nếu path là một URL hoàn chỉnh (ví dụ link từ Cloudinary: https://res.cloudinary.com/...)
  // Trả về luôn path đó mà không nối thêm BASE_URL
  if (path.startsWith("http")) {
    return path;
  }

  // 3. Nếu path là đường dẫn tương đối (ví dụ lưu trong DB là "poster1.jpg" hoặc "/poster1.jpg")
  // Tiến hành làm sạch path (xóa dấu / ở đầu)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Trả về URL trỏ đến thư mục tĩnh trên Backend Spring Boot
  // Lưu ý: Đảm bảo Spring Boot đã cấu hình Resource Handler cho thư mục /uploads/
  return `${BASE_URL}/uploads/movies/${cleanPath}`;
};