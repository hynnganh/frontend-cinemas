"use client";
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const adminRes = await fetch('http://localhost:8080/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (adminRes.ok) {
          const data = await adminRes.json();
          setAdminInfo(data.data);
        }
      } catch (error) {
        console.error("Lỗi fetch dữ liệu hệ thống:", error);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear(); 
    Cookies.remove('token'); 
    Cookies.remove('role');
    router.push('/login');
  };

  const MENU_ITEMS = [
    { label: "Tổng quan", icon: <LayoutDashboard size={20} />, href: "/super-admin" },
    { label: "Thể loại", icon: <Tag size={20} />, href: "/super-admin/genre" },
    { label: "Phim ảnh", icon: <Film size={20} />, href: "/super-admin/movie" },
    { label: "Hệ thống rạp", icon: <MapPin size={20} />, href: "/super-admin/cinema" },
    { label: "Lịch chiếu", icon: <Calendar size={20} />, href: "/super-admin/showtime" },
    { label: "Sự kiện", icon: <Tag size={20} />, href: "/super-admin/event" },
    { label: "Voucher", icon: <Zap size={20} />, href: "/super-admin/voucher" },
    { label: "Banner", icon: <BarChart3 size={20} />, href: "/super-admin/banner" },
    { label: "Quản lý đơn hàng", icon: <MessageSquare size={20} />, href: "/super-admin/order" },
    { label: "Người dùng", icon: <Users size={20} />, href: "/super-admin/user" },
    { label: "Giá vé & Ghế", icon: <Ticket size={20} />, href: "/super-admin/seat-price" },
    { label: "Combo", icon: <Box size={20} />, href: "/super-admin/food-combo" },
    { label: "Thống kê", icon: <BarChart3 size={20} />, href: "/super-admin/analytic" },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-400 flex font-sans overflow-hidden">
      {/* CSS Injection để ẩn thanh cuộn */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className={`h-screen sticky top-0 transition-all duration-500 flex flex-col py-8 border-r border-white/5 bg-black/20 backdrop-blur-xl shrink-0 ${isSidebarOpen ? 'w-64' : 'w-24'}`}>
        {/* Logo */}
        <div className="mb-10 px-6 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Fingerprint size={22} />
          </div>
          {isSidebarOpen && <span className="text-white font-bold tracking-tighter text-xl truncate">A&K CORE</span>}
        </div>

        {/* Menu Items - Có thể cuộn nhưng ẩn scrollbar */}
        <nav className="flex-1 w-full px-4 space-y-1.5 overflow-y-auto hide-scrollbar">
          {MENU_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all group relative ${active ? 'bg-white/5 text-white' : 'hover:bg-white/[0.02] hover:text-zinc-200'}`}
              >
                {active && <div className="absolute left-0 w-1 h-5 bg-red-600 rounded-full" />}
                <span className={`${active ? 'text-red-500' : 'group-hover:text-red-400'} shrink-0`}>{item.icon}</span>
                {isSidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="w-full px-4 mt-4 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-600 hover:bg-red-500/5 hover:text-red-500 transition-all">
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="text-sm font-bold">Thoát</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/10 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full ml-4 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh..." 
                className="w-full bg-white/[0.03] border border-white/5 py-2 pl-10 pr-4 rounded-full text-xs outline-none focus:border-red-500/50 transition-all" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">
                  {adminInfo ? `${adminInfo.firstName} ${adminInfo.lastName}` : "Super Admin"}
                </p>
                <p className="text-[10px] text-red-500 mt-1 uppercase font-black tracking-widest">
                  {adminInfo?.roles || "System Root"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shadow-inner flex-shrink-0">
                <img 
                  src={adminInfo?.avatarUrl || "https://ui-avatars.com/api/?name=Admin&background=random"} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung trang thay đổi theo route - Cuộn ẩn scrollbar */}
        <main className="flex-1 p-8 overflow-y-auto hide-scrollbar relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* RIGHT SIDEBAR - Trạng thái rạp */}
      <aside className="hidden xl:flex w-80 h-screen border-l border-white/5 bg-black/20 backdrop-blur-xl p-8 flex-col gap-8 shrink-0">
        <div>
          <h3 className="text-white font-bold text-sm mb-6 flex items-center justify-between">
            Trạng thái rạp
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full animate-pulse">Live</span>
          </h3>
          <div className="space-y-6 overflow-y-auto hide-scrollbar max-h-[50vh]">
            {cinemaStats.length > 0 ? cinemaStats.map((r, i) => (
              <div key={i} className="space-y-2 group cursor-help">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-zinc-300 group-hover:text-white transition-colors">{r.cinemaName}</span>
                  <span className="text-zinc-500">{r.occupancyRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      r.occupancyRate > 80 ? 'bg-red-500' : r.occupancyRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${r.occupancyRate}%` }} 
                  />
                </div>
              </div>
            )) : (
              <p className="text-[10px] text-zinc-600 italic text-center py-4">Đang kết nối API rạp...</p>
            )}
          </div>
        </div>

        <div className="mt-auto p-5 bg-zinc-900/50 border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -bottom-2 -right-2 text-white/5 group-hover:text-red-600/10 transition-colors">
            <Zap size={60} />
          </div>
          <p className="text-white text-xs font-bold mb-1 italic">Hệ thống Core v2.4</p>
          <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">Dữ liệu được mã hóa đầu cuối với node A-K.</p>
          <button className="w-full py-2.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded-lg border border-white/5 hover:bg-white hover:text-black transition-all">
            KIỂM TRA LOGS
          </button>
        </div>
      </aside>
    </div>
  );
}