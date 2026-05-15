export type RoleType = "USER" | "ADMIN" | "SUPER_ADMIN";

export const getTokenByRole = (role?: RoleType) => {
  if (typeof window === "undefined") return null;

  // ưu tiên role truyền vào
  if (role === "ADMIN")
    return localStorage.getItem("admin_token");

  if (role === "SUPER_ADMIN")
    return localStorage.getItem("super_admin_token");

  if (role === "USER")
    return localStorage.getItem("user_token");

  // ✅ AUTO FALLBACK (QUAN TRỌNG)
  return (
    localStorage.getItem("user_token") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("super_admin_token") ||
    localStorage.getItem("token") // giữ backward compatibility
  );
};