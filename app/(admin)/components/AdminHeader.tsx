"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, ChevronDown, ShieldCheck, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import { apiAdminRequest } from "@/app/lib/api"; // Đảm bảo đường dẫn import đúng

export default function AdminHeader() {
  const [thongTinAdmin, setThongTinAdmin] = useState<any>(null);
  const [hienMenuCaNhan, setHienMenuCaNhan] = useState(false);

  const xuLyDangXuat = useCallback(() => {
    const keyToken = 'token_admin';
    localStorage.removeItem(keyToken);
    Cookies.remove(keyToken, { path: '/' });
    localStorage.removeItem('user_info_admin');
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const taiThongTin = async () => {
      // Sử dụng apiAdminRequest thay vì fetch thủ công
      try {
        const res = await apiAdminRequest('/api/v1/users/me');

        if (res.ok) {
          const ketQua = await res.json();
          const duLieuTho = ketQua.data?.user || ketQua.data;
          
          const quyenTaiKhoan: string[] = duLieuTho?.roles?.map((r: any) => r.roleName || r) || [];
          if (!quyenTaiKhoan.includes("ROLE_ADMIN") && !quyenTaiKhoan.includes("ADMIN")) {
            xuLyDangXuat();
            return;
          }

          setThongTinAdmin(duLieuTho);
        } else if (res.status === 401 || res.status === 403) {
          xuLyDangXuat();
        }
      } catch (loi) {
        console.error("Lỗi lấy thông tin Quản trị viên:", loi);
      }
    };

    taiThongTin();
  }, [xuLyDangXuat]);

  return (
    <header className="h-20 border-b border-zinc-900 bg-[#060608] px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 shrink-0 select-none">
      
      {/* THANH TÌM KIẾM */}
      <div className="relative w-64 md:w-96 group">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" 
          size={16} 
        />
        <input 
          type="text"
          placeholder="Tìm phim, mã vé hoặc cụm rạp..." 
          className="w-full bg-[#0c0c10] border border-zinc-900 rounded-2xl py-2.5 pl-12 pr-4 text-[11px] font-bold outline-none focus:border-zinc-800 transition-all text-white placeholder:text-zinc-700"
        />
      </div>

      {/* PHẦN TIỆN ÍCH BÊN PHẢI */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* THÔNG BÁO */}
        <button className="relative p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all group">
          <Bell size={16} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-600 rounded-full border border-[#060608] animate-pulse"></span>
        </button>
        
        <div className="h-6 w-[1px] bg-zinc-900 hidden sm:block"></div>

        {/* MENU THẢ XUỐNG CỦA TÀI KHOẢN */}
        <div className="relative">
          <button 
            onClick={() => setHienMenuCaNhan(!hienMenuCaNhan)}
            className="flex items-center gap-3 pl-2 group transition-all"
          >
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none">
                {thongTinAdmin ? `${thongTinAdmin.lastName} ${thongTinAdmin.firstName}` : "QUẢN TRỊ VIÊN"}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1.5">
                <ShieldCheck size={10} className="text-red-500" />
                <p className="text-[8px] font-black text-red-500 uppercase tracking-wider">
                  {Array.isArray(thongTinAdmin?.roles) 
                    ? (thongTinAdmin.roles[0]?.roleName || thongTinAdmin.roles[0]).replace('ROLE_', '') 
                    : "ADMIN"}
                </p>
              </div>
            </div>

            {/* ẢNH ĐẠI DIỆN */}
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-zinc-700 transition-all">
              {thongTinAdmin?.avatar ? (
                <img src={thongTinAdmin.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#0c0c10] flex items-center justify-center">
                  <span className="text-[11px] font-black text-zinc-500 group-hover:text-red-500 transition-colors">
                    {thongTinAdmin?.firstName?.charAt(0) || "A"}
                  </span>
                </div>
              )}
            </div>
            
            <ChevronDown size={12} className={`text-zinc-600 transition-transform duration-300 ${hienMenuCaNhan ? 'rotate-180' : ''}`} />
          </button>

          {/* MENU CHI TIẾT KHI BẤM VÀO TÀI KHOẢN */}
          {hienMenuCaNhan && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setHienMenuCaNhan(false)} />
              <div className="absolute right-0 mt-3 w-56 bg-zinc-950 border border-zinc-900 rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-zinc-900 mb-1 bg-[#0c0c10]/50 rounded-lg">
                  <p className="text-[8px] text-zinc-500 font-black uppercase tracking-wider mb-0.5">Tài khoản vận hành</p>
                  <p className="text-[11px] text-zinc-300 truncate font-bold">{thongTinAdmin?.email || 'Đang đồng bộ...'}</p>
                </div>
                
                <div className="py-0.5">
                  <button 
                    onClick={xuLyDangXuat}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-red-500 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut size={13} /> Đăng xuất hệ thống
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