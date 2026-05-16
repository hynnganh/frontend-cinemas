"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Film, Users, MapPin, 
  LogOut, Search, Menu, Zap, Calendar, 
  BarChart3, Fingerprint, MessageSquare, Ticket, Tag, 
  Box
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null); 
  const [cinemaStats, setCinemaStats] = useState<any[]>([]); 
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Đăng xuất cô lập - Tuyệt đối không xóa token_admin của tab bên cạnh
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
      // ✅ BỎ TOKEN CHUNG - CHỈ ĐỌC DUY NHẤT TOKEN_SUPER_ADMIN
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

  const MENU_ITEMS = [
    { label: "Tổng quan", icon: <LayoutDashboard size={18} />, href: "/super-admin" },
    { label: "Thể loại", icon: <Tag size={18} />, href: "/super-admin/genre" },
    { label: "Phim ảnh", icon: <Film size={18} />, href: "/super-admin/movie" },
    { label: "Hệ thống rạp", icon: <MapPin size={18} />, href: "/super-admin/cinema" },
    { label: "Lịch chiếu", icon: <Calendar size={18} />, href: "/super-admin/showtime" },
    { label: "Sự kiện", icon: <Tag size={18} />, href: "/super-admin/event" },
    { label: "Voucher", icon: <Zap size={18} />, href: "/super-admin/voucher" },
    { label: "Banner", icon: <BarChart3 size={18} />, href: "/super-admin/banner" },
    { label: "Quản lý đơn hàng", icon: <MessageSquare size={18} />, href: "/super-admin/order" },
    { label: "Người dùng", icon: <Users size={18} />, href: "/super-admin/user" },
    { label: "Giá vé & Ghế", icon: <Ticket size={18} />, href: "/super-admin/seat-price" },
    { label: "Combo", icon: <Box size={18} />, href: "/super-admin/food-combo" },
    { label: "Thống kê", icon: <BarChart3 size={18} />, href: "/super-admin/analytic" },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-400 flex font-sans overflow-hidden select-none">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* SIDEBAR */}
      <aside className={`h-screen sticky top-0 transition-all duration-300 flex flex-col py-8 border-r border-white/5 bg-[#09090b]/40 backdrop-blur-2xl shrink-0 z-40 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="mb-10 px-6 flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => router.push('/super-admin')}>
          <div className="w-10 h-10 bg-gradient-to-tr from-red-700 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/30 shrink-0">
            <Fingerprint size={20} className="animate-pulse" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <span className="text-white font-[1000] tracking-tighter text-base italic leading-none">A&K CORE</span>
              <span className="text-[7px] text-red-500 font-black tracking-[0.3em] mt-1 uppercase">Root Executive</span>
            </div>
          )}
        </div>

        <nav className="flex-1 w-full px-3 space-y-1 overflow-y-auto hide-scrollbar">
          {MENU_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${active ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'hover:bg-white/[0.02] hover:text-zinc-200'}`}
              >
                <span className={`${active ? 'text-white' : 'text-zinc-600 group-hover:text-red-500'} transition-colors shrink-0`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="text-[11px] font-black uppercase tracking-wider truncate animate-in fade-in duration-200">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="w-full px-3 mt-4 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-zinc-600 hover:bg-red-600/10 hover:text-red-500 transition-all group">
            <LogOut size={18} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span className="text-[11px] font-black uppercase tracking-wider">Thoát Hệ Thống</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#020203]">
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#050507]/60 backdrop-blur-xl shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-colors">
              <Menu size={18} />
            </button>
            <div className="relative max-w-md w-full ml-2 group hidden md:block">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tra cứu log hệ thống, mã rạp, token..." 
                className="w-full bg-white/[0.02] border border-white/5 py-2.5 pl-11 pr-4 rounded-xl text-[11px] font-bold outline-none focus:border-red-500/30 transition-all text-white placeholder:text-zinc-700" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-[1000] text-white uppercase italic tracking-tighter leading-none">
                  {adminInfo ? `${adminInfo.firstName} ${adminInfo.lastName}` : "SUPER ROOT"}
                </p>
                <p className="text-[8px] text-red-500 mt-1.5 uppercase font-black tracking-[0.25em]">
                  {Array.isArray(adminInfo?.roles) ? adminInfo.roles[0].replace('ROLE_', '') : "SUPER_ADMIN"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl flex-shrink-0">
                <img 
                  src={adminInfo?.avatar || "https://ui-avatars.com/api/?name=Super+Admin&background=000&color=fff"} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto hide-scrollbar relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/[0.02] blur-[150px] rounded-full -z-10 pointer-events-none" />
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden xl:flex w-80 h-screen border-l border-white/5 bg-[#050507]/40 backdrop-blur-2xl p-8 flex-col gap-8 shrink-0 z-20">
        <div>
          <h3 className="text-white text-[11px] font-black uppercase tracking-widest mb-6 flex items-center justify-between">
            Trạng thái rạp công suất
            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full font-bold animate-pulse tracking-normal">Live Node</span>
          </h3>
          <div className="space-y-5 overflow-y-auto hide-scrollbar max-h-[60vh]">
            {cinemaStats.map((r, i) => (
              <div key={i} className="space-y-2 group">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-400 group-hover:text-white transition-colors">{r.cinemaName}</span>
                  <span className={r.occupancyRate > 80 ? 'text-red-500' : r.occupancyRate > 50 ? 'text-amber-500' : 'text-emerald-500'}>
                    {r.occupancyRate}%
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      r.occupancyRate > 80 ? 'bg-gradient-to-r from-red-600 to-rose-500' : r.occupancyRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${r.occupancyRate}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-5 bg-gradient-to-br from-zinc-900/50 to-black/30 border border-white/5 rounded-3xl relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white/[0.02] group-hover:text-red-600/[0.04] transition-colors duration-500">
            <Zap size={100} />
          </div>
          <p className="text-white text-[10px] font-black uppercase tracking-wider mb-1 italic">Hệ thống Core v2.4</p>
          <p className="text-[9px] text-zinc-600 mb-4 leading-relaxed">Bộ mã hóa token và phân mảnh đa tab độc lập.</p>
          <button className="w-full py-3 bg-zinc-900/60 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-red-600 hover:text-white hover:border-transparent transition-all duration-300">
            KIỂM TRA LOGS
          </button>
        </div>
      </aside>
    </div>
  );
}