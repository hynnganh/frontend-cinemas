export const BASE_URL = "http://localhost:8080";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Lấy token an toàn từ localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  // Kiểm tra nếu body là FormData (để upload file)
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  // Nếu KHÔNG phải FormData thì mới set Content-Type là JSON
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Xử lý endpoint để tránh lỗi undefined hoặc thừa dấu /
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${safeEndpoint}`;

  return fetch(fullUrl, { ...options, headers });
}

export const getImageUrl = (path: string) => {
  if (!path) return "https://placehold.co/400x600?text=No+Poster";
  if (path.startsWith("http")) return path;
  
  // Loại bỏ dấu / ở đầu nếu có để nối chuỗi chuẩn
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/uploads/movies/${cleanPath}`;
};