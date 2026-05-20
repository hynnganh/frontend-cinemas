"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  User, Ticket, Settings, CreditCard, LogOut, 
  ChevronDown, ShieldCheck, Loader2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "../../lib/api";
import { getTokenByRole, RoleType } from "../../lib/auth";

export default function TopMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Memoize getCurrentRole để không làm thay đổi hook dependencies
  const getCurrentRole = useCallback((): RoleType => {
    if (pathname.startsWith("/super-admin")) return "SUPER_ADMIN";
    if (pathname.startsWith("/admin")) return "ADMIN";
    return "USER";
  }, [pathname]);

  const handleClearAuth = useCallback((role: RoleType) => {
    const tokenKey = role === "SUPER_ADMIN" ? "token_super_admin" : role === "ADMIN" ? "token_admin" : "token_user";
    localStorage.removeItem(tokenKey);
    Cookies.remove(tokenKey, { path: '/' });
    localStorage.removeItem(`user_info_${role.toLowerCase()}`);
    setUser(null);
  }, []);

  const fetchLatestProfile = useCallback(async () => {
    const role = getCurrentRole();
    const token = getTokenByRole(role);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/api/v1/users/me', { method: "GET" }, role);
      if (res.ok) {
        const result = await res.json();
        const rawData = result.data?.user || result.data || result;
        const accountRoles: string[] = rawData?.roles?.map((r: any) => r.roleName || r) || [];
        
        if (role === "USER" && !accountRoles.includes("ROLE_USER") && !accountRoles.includes("USER")) {
          setUser(null);
        } else {
          setUser(rawData);
          localStorage.setItem(`user_info_${role.toLowerCase()}`, JSON.stringify(rawData));
        }
      } else {
        handleClearAuth(role);
      }
    } catch (err) {
      const stored = localStorage.getItem(`user_info_${role.toLowerCase()}`);
      if (stored) setUser(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  }, [getCurrentRole, handleClearAuth]);

  useEffect(() => {
    fetchLatestProfile();

    const handleAuthChange = () => fetchLatestProfile();

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [fetchLatestProfile]);

  const handleLogout = () => {
    const currentRole = getCurrentRole();
    handleClearAuth(currentRole);
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = (currentRole === "SUPER_ADMIN" || currentRole === "ADMIN") ? "/auth" : "/";
  };

  const isSuperAdmin = user?.roles?.some((r: any) => ["ROLE_SUPER_ADMIN", "SUPER_ADMIN"].includes(r.roleName || r));
  const isAdmin = user?.roles?.some((r: any) => ["ROLE_ADMIN", "ADMIN"].includes(r.roleName || r));

  return (
    <div className="bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-[999]">
      <div className="max-w-[1440px] mx-auto flex justify-end items-center gap-8 px-6 md:px-12 h-12">
        
        {user && (
          <div className="flex items-center gap-6">
            <Link href="/ticket" className="flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest group transition-all">
              <Ticket size={14} className="text-red-600 group-hover:animate-bounce" />
              <span>Vé của tôi</span>
            </Link>
            <Link href="/discounts" className="flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest group transition-all">
              <CreditCard size={14} className="text-red-600 group-hover:scale-110 transition-transform" />
              <span>Mã giảm giá</span>
            </Link>
            <div className="h-3 w-[1px] bg-white/20"></div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 opacity-50">
            <Loader2 size={14} className="animate-spin text-red-600" />
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Đang tải...</span>
          </div>
        ) : user ? (
          <div className="relative group h-full flex items-center">
            <div className="flex items-center gap-4 cursor-pointer select-none">
              <div className="flex flex-col items-end leading-none gap-1">
                <span className="text-[11px] font-black text-zinc-100 group-hover:text-red-500 transition-all uppercase tracking-wider italic">
                  {user.lastName} {user.firstName}
                </span>
                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase border ${isSuperAdmin ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : isAdmin ? "bg-red-600/10 text-red-600 border-red-600/20" : "bg-white/5 text-zinc-400 border-white/10"}`}>
                  {isSuperAdmin ? "Super Admin" : isAdmin ? "System Admin" : "Hội viên A&K"}
                </span>
              </div>
              
              <div className="relative w-9 h-9 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden group-hover:border-red-600 transition-all shadow-xl">
                {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover scale-110" /> : <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-zinc-800 to-black group-hover:from-red-600 transition-all"><span className="text-[10px] font-black">{user.firstName?.charAt(0)}</span></div>}
              </div>
              <ChevronDown size={12} className="text-zinc-500 group-hover:text-red-500 group-hover:rotate-180 transition-all duration-300" />
            </div>

            <div className="absolute right-0 top-[100%] pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[110]">
              <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]"><p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Trung tâm hội viên</p></div>
                <div className="p-1.5 space-y-1">
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group/item transition-all"><div className="p-2 bg-zinc-900 rounded-lg group-hover/item:bg-red-600 group-hover/item:text-white transition-all text-red-600"><Settings size={14} /></div><span className="text-[10px] font-bold text-zinc-400 group-hover/item:text-white uppercase tracking-wider">Tài khoản</span></Link>
                  <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group/item transition-all"><div className="p-2 bg-zinc-900 rounded-lg group-hover/item:bg-red-600 group-hover/item:text-white transition-all text-red-600"><CreditCard size={14} /></div><span className="text-[10px] font-bold text-zinc-400 group-hover/item:text-white uppercase tracking-wider">Đơn hàng</span></Link>
                  {(isAdmin || isSuperAdmin) && (
                    <Link href={isSuperAdmin ? "/super-admin" : "/admin"} className="mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-600/5 border border-red-600/10 hover:bg-red-600 group/admin transition-all"><ShieldCheck size={14} className="text-red-600 group-hover/admin:text-white" /><span className="text-[10px] font-black text-red-600 group-hover/admin:text-white uppercase tracking-widest">Bảng quản trị</span></Link>
                  )}
                </div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all border-t border-white/5 group/logout"><LogOut size={13} className="group-hover/logout:translate-x-0.5 transition-transform" /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Đăng xuất</span></button>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/auth" className="flex items-center gap-3 text-zinc-300 hover:text-red-500 transition-all text-[11px] font-black uppercase tracking-[0.2em] group">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10 group-hover:border-red-600 transition-all"><User size={14} /></div>
            <span>Đăng nhập / Đăng ký</span>
          </Link>
        )}
      </div>
    </div>
  );
}