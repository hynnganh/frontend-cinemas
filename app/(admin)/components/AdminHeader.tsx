"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, User, ChevronDown, ShieldCheck, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminHeader() {
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = useCallback(() => {
    const tokenKey = 'token_admin';
    
    localStorage.removeItem(tokenKey);
    Cookies.remove(tokenKey, { path: '/' });

    localStorage.removeItem('user_info_admin');

    window.dispatchEvent(new Event("auth-changed"));

    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // ✅ CHỈ ĐỌC DUY NHẤT TOKEN_ADMIN
      const token = localStorage.getItem('token_admin');
      
      if (!token) {
        handleLogout();
        return;
      }

      try {
        const res = await fetch('http://localhost:8080/api/v1/users/me', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const result = await res.json();
          const rawData = result.data?.user || result.data;
          
          const accountRoles: string[] = rawData?.roles?.map((r: any) => r.roleName || r) || [];
          if (!accountRoles.includes("ROLE_ADMIN") && !accountRoles.includes("ADMIN")) {
            handleLogout();
            return;
          }

          setAdminInfo(rawData);
        } else if (res.status === 401 || res.status === 403) {
          handleLogout();
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin Admin Header:", error);
      }
    };

    fetchData();
  }, [handleLogout]);

  // Phần render UI giữ nguyên giao diện cinema sang trọng của bạn...
  return (
    <header className="h-20 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 shrink-0 select-none">
      
      {/* Search Bar */}
      <div className="relative w-64 md:w-96 group">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" 
          size={16} 
        />
        <input 
          type="text"
          placeholder="Tìm phim, mã vé hoặc cụm rạp..." 
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-[11px] font-bold outline-none focus:border-red-600/30 transition-all text-white placeholder:text-zinc-700 shadow-inner"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Notifications */}
        <button className="relative p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group">
          <Bell size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-[#050505] animate-pulse"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 group transition-all"
          >
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-[1000] text-white uppercase italic tracking-tighter leading-none">
                {adminInfo ? `${adminInfo.lastName} ${adminInfo.firstName}` : "QUẢN TRỊ VIÊN"}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1.5">
                <ShieldCheck size={10} className="text-red-500" />
                <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em]">
                  {Array.isArray(adminInfo?.roles) 
                    ? (adminInfo.roles[0]?.roleName || adminInfo.roles[0]).replace('ROLE_', '') 
                    : "ADMIN"}
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-red-600/50 transition-all shadow-2xl">
              {adminInfo?.avatar ? (
                <img src={adminInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                  <span className="text-[11px] font-black text-zinc-500 group-hover:text-red-500 transition-colors">
                    {adminInfo?.firstName?.charAt(0) || "A"}
                  </span>
                </div>
              )}
            </div>
            
            <ChevronDown size={14} className={`text-zinc-600 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-4 w-60 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-white/5 mb-1 bg-white/[0.02] rounded-t-[1.5rem]">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Quản lý cụm rạp</p>
                  <p className="text-xs text-zinc-300 truncate font-bold italic">{adminInfo?.email || 'Đang đồng bộ...'}</p>
                </div>
                
                <div className="py-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all mt-1"
                  >
                    <LogOut size={14} /> Đăng xuất quản trị
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}