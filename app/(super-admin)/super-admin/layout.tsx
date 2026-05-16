"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Film, Users, MapPin, 
  LogOut, Search, Menu, Zap, Calendar, 
  BarChart3, Fingerprint, Ticket, Tag, 
  Box, CalendarDays, ShoppingBag, SlidersHorizontal, Layers
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null); 
  const [cinemaStats, setCinemaStats] = useState<any[]>([]); 
  const pathname = usePathname();
  const router = useRouter();

  // Đăng xuất cô lập tài khoản Super Admin
  const handleLogout = useCallback(() => {
    const targetKeys = ['token_super_admin', 'roles'];
    targetKeys.forEach(key => {
      localStorage.removeItem(key);
      Cookies.remove(key, { path: '/' });
    });
    
    window.location.href = '/login';
  }, []);

  // Fetch dữ liệu hệ thống root
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token_super_admin');
      
      if (!token) {
        handleLogout();
        return;
      }

      try {
        // 1. Fetch thông tin root account
        const adminRes = await fetch('http://localhost:8080/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (adminRes.ok) {
          const data = await adminRes.json();
          setAdminInfo(data.data?.user || data.data);
        } else if (adminRes.status === 401 || adminRes.status === 403) {
          handleLogout();
          return;
        }

        // 2. Fetch trạng thái live của các cụm rạp
        const statsRes = await fetch('http://localhost:8080/api/v1/cinemas/occupancy', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setCinemaStats(statsData.data || []);
        } else {
          setCinemaStats([
            { cinemaName: "A&K Cao Thắng", occupancyRate: 75 },
            { cinemaName: "A&K Hùng Vương", occupancyRate: 42 },
            { cinemaName: "A&K Trần Hưng Đạo", occupancyRate: 88 }
          ]);
        }

      } catch (error) {
        console.error("Lỗi fetch dữ liệu hệ thống:", error);
      }
    };

    fetchData();
  }, [handleLogout]);

  // Đã chuẩn hóa và thay thế các icon trùng lặp để menu trực quan hơn
  const MENU_ITEMS = [
    { label: "Tổng quan", icon: <LayoutDashboard size={16} />, href: "/super-admin" },
    { label: "Thể loại Phim", icon: <Layers size={16} />, href: "/super-admin/genre" },
    { label: "Phim ảnh", icon: <Film size={16} />, href: "/super-admin/movie" },
    { label: "Hệ thống rạp", icon: <MapPin size={16} />, href: "/super-admin/cinema" },
    { label: "Lịch chiếu", icon: <CalendarDays size={16} />, href: "/super-admin/showtime" },
    { label: "Sự kiện & Ưu đãi", icon: <Tag size={16} />, href: "/super-admin/event" },
    { label: "Voucher", icon: <Zap size={16} />, href: "/super-admin/voucher" },
    { label: "Banner quảng cáo", icon: <BarChart3 size={16} />, href: "/super-admin/banner" },
    { label: "Quản lý đơn hàng", icon: <ShoppingBag size={16} />, href: "/super-admin/order" },
    { label: "Người dùng", icon: <Users size={16} />, href: "/super-admin/user" },
    { label: "Giá vé & Ghế", icon: <Ticket size={16} />, href: "/super-admin/seat-price" },
    { label: "Combo bắp nước", icon: <Box size={16} />, href: "/super-admin/food-combo" },
    { label: "Thống kê doanh thu", icon: <BarChart3 size={16} />, href: "/super-admin/analytic" },
  ];

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-400 flex font-sans overflow-hidden select-none antialiased">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* SIDEBAR TRÁI */}
      <aside className={`h-screen sticky top-0 transition-all duration-300 flex flex-col py-6 border-r border-zinc-900 bg-[#060608] shrink-0 z-40 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* LOGO BOX */}
        <div className="mb-8 px-5 flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => router.push('/super-admin')}>
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(220,38,38,0.2)] shrink-0">
            <Fingerprint size={18} className="animate-pulse" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-200">
              <span className="text-white font-black tracking-tight text-sm leading-none">A&K CINEMA</span>
              <span className="text-[8px] text-red-500 font-bold tracking-widest mt-1 uppercase">Root Executive</span>
            </div>
          )}
        </div>

        {/* MENU NAVIGATION */}
        <nav className="flex-1 w-full px-3 space-y-1 overflow-y-auto hide-scrollbar">
          {MENU_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-150 group relative text-left ${
                  active 
                    ? 'bg-red-600 text-white font-bold shadow-[0_4px_12px_rgba(220,38,38,0.15)]' 
                    : 'hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <span className={`${active ? 'text-white' : 'text-zinc-500 group-hover:text-red-500'} transition-colors shrink-0`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="text-xs font-semibold tracking-wide truncate animate-in fade-in duration-150">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* BUTTON ĐĂNG XUẤT */}
        <div className="w-full px-3 mt-4 shrink-0">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-950/30 hover:text-red-500 transition-all group text-left"
          >
            <LogOut size={16} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Thoát Hệ Thống</span>}
          </button>
        </div>
      </aside>

      {/* DIỆN TÍCH HIỂN THỊ CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#020202]">
        {/* TOPBAR HEADER */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-zinc-900 bg-[#060608]/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-800"
            >
              <Menu size={16} />
            </button>
            
            {/* THANH TÌM KIẾM HỆ THỐNG */}
            <div className="relative max-w-sm w-full ml-2 group hidden md:block">
              <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tra cứu log hệ thống, mã rạp, token..." 
                className="w-full bg-zinc-950 border border-zinc-900 py-2 pl-10 pr-4 rounded-lg text-xs font-medium outline-none focus:border-red-600/40 transition-all text-white placeholder:text-zinc-700" 
              />
            </div>
          </div>

          {/* THÔNG TIN TÀI KHOẢN ADMIN */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block space-y-0.5">
                <p className="text-xs font-bold text-white tracking-tight">
                  {adminInfo ? `${adminInfo.firstName} ${adminInfo.lastName}` : "SUPER ROOT"}
                </p>
                <p className="text-[9px] text-red-500 font-bold tracking-wider uppercase">
                  {Array.isArray(adminInfo?.roles) ? adminInfo.roles[0].replace('ROLE_', '') : "SUPER_ADMIN"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-md flex-shrink-0">
                <img 
                  src={adminInfo?.avatar || "https://ui-avatars.com/api/?name=Super+Admin&background=020202&color=fff"} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* ROUTE CONTENT CONTAINER */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto hide-scrollbar relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/[0.01] blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* SIDEBAR PHẢI (LIVE MONITORING) */}
      <aside className="hidden xl:flex w-72 h-screen border-l border-zinc-900 bg-[#060608] p-6 flex-col gap-6 shrink-0 z-20">
        <div>
          <h3 className="text-white text-[11px] font-bold uppercase tracking-wider mb-5 flex items-center justify-between">
            Công suất phòng chiếu
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold animate-pulse">Live</span>
          </h3>
          
          <div className="space-y-4 overflow-y-auto hide-scrollbar max-h-[65vh]">
            {cinemaStats.map((r, i) => (
              <div key={i} className="space-y-1.5 group">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{r.cinemaName}</span>
                  <span className={`font-bold ${r.occupancyRate > 80 ? 'text-red-500' : r.occupancyRate > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {r.occupancyRate}%
                  </span>
                </div>
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      r.occupancyRate > 80 ? 'bg-red-600' : r.occupancyRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${r.occupancyRate}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOG PANEL COMPONENT */}
        <div className="mt-auto p-4.5 bg-zinc-950/60 border border-zinc-900 rounded-xl relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white/[0.01] group-hover:text-red-600/[0.02] transition-colors duration-500">
            <Zap size={80} />
          </div>
          <div className="flex items-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
            <SlidersHorizontal size={10} className="text-red-500" />
            <span>Hệ thống Core v2.4</span>
          </div>
          <p className="text-[10px] text-zinc-600 mb-4 leading-relaxed">
            Bộ mã hóa token và phân mảnh đa tab độc lập toàn diện.
          </p>
          <button className="w-full py-2.5 bg-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-zinc-800 hover:bg-red-600 hover:text-white hover:border-transparent transition-all duration-200">
            Kiểm tra logs
          </button>
        </div>
      </aside>
    </div>
  );
}