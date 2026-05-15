"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, User, ChevronDown, ShieldCheck, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  // Hàm đăng xuất dùng chung
  const handleLogout = useCallback(() => {
    // Dọn dẹp tất cả các loại token để tránh xung đột role
    const keys = ['token', 'token_admin', 'token_super_admin', 'token_user', 'roles'];
    keys.forEach(key => {
      localStorage.removeItem(key);
      Cookies.remove(key);
    });

    // Điều hướng về trang login và xóa cache router
    window.location.href = '/login';
  }, []);

  // Lấy dữ liệu người dùng thực tế
  useEffect(() => {
    const fetchData = async () => {
      // ✅ Ưu tiên lấy token theo cấp bậc hoặc token chung
      const token = localStorage.getItem('token_super_admin') || 
                    localStorage.getItem('token_admin') || 
                    localStorage.getItem('token');
      
      if (!token) {
        // Nếu vào trang Admin mà không có token phù hợp, đẩy ra ngoài
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
          // Map dữ liệu từ backend (giả định cấu trúc result.data hoặc result.data.user)
          setAdminInfo(result.data?.user || result.data);
        } else if (res.status === 401) {
          // Token hết hạn hoặc không hợp lệ
          handleLogout();
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin Header:", error);
      }
    };

    fetchData();
  }, [handleLogout]);

  return (
    <header className="h-20 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 shrink-0">
      
      {/* Search Bar - Cinema Style */}
      <div className="relative w-64 md:w-96 group">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" 
          size={16} 
        />
        <input 
          type="text"
          placeholder="Tìm phim, mã vé hoặc rạp..." 
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
                {adminInfo ? `${adminInfo.firstName} ${adminInfo.lastName}` : "Đang tải..."}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1.5">
                <ShieldCheck size={10} className="text-red-600" />
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  {/* Hiển thị role đầu tiên trong mảng roles */}
                  {Array.isArray(adminInfo?.roles) ? adminInfo.roles[0].replace('ROLE_', '') : "ADMIN"}
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-red-600/50 transition-all shadow-2xl">
              {adminInfo?.avatar ? (
                <img src={adminInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                  <User size={18} className="text-zinc-600 group-hover:text-red-600 transition-colors" />
                </div>
              )}
            </div>
            
            <ChevronDown size={14} className={`text-zinc-600 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Overlay để click out-side */}
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setShowProfileMenu(false)} 
              />
              <div className="absolute right-0 mt-4 w-60 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-white/5 mb-1 bg-white/[0.02] rounded-t-[1.5rem]">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Hệ thống quản trị</p>
                  <p className="text-xs text-zinc-300 truncate font-bold italic">{adminInfo?.email || 'Đang xác thực...'}</p>
                </div>
                
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-all group/item">
                    <User size={14} className="group-hover/item:text-red-600" /> Hồ sơ cá nhân
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all mt-1"
                  >
                    <LogOut size={14} /> Đăng xuất
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