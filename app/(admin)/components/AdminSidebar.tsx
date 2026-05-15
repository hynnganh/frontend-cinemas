"use client";
import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Calendar, 
  Users, 
  Ticket, 
  LogOut, 
  ShoppingBag,
  Film,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'Tổng quan', icon: LayoutDashboard, href: '/admin' },
    { name: 'Phòng chiếu', icon: Monitor, href: '/admin/rooms' }, 
    { name: 'Lịch chiếu', icon: Calendar, href: '/admin/showtimes' },
    { name: 'Quản lý Đơn hàng', icon: Ticket, href: '/admin/orders' }, 
    { name: 'Quản lý Combo', icon: ShoppingBag, href: '/admin/combos' },
    { name: 'Khách hàng', icon: Users, href: '/admin/users' },
  ];

  // Logic đăng xuất hệ thống (Dọn sạch 3 loại token)
  const handleLogout = () => {
    // 1. Danh sách các key cần dọn dẹp
    const keys = [
      'token', 
      'token_admin', 
      'token_super_admin', 
      'token_user', 
      'roles'
    ];

    // 2. Xóa sạch LocalStorage
    keys.forEach(key => localStorage.removeItem(key));

    // 3. Xóa sạch Cookies
    keys.forEach(key => Cookies.remove(key));

    // 4. Thông báo và điều hướng
    toast.success("Hệ thống đã được đăng xuất an toàn!");
    
    // Ép làm mới toàn bộ để xóa sạch state cũ của React
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 h-screen bg-[#080808] border-r border-white/5 flex flex-col sticky top-0 overflow-hidden z-[100]">
      
      {/* Logo Section - A&K Branding */}
      <div className="p-8 flex items-center gap-4 shrink-0 group cursor-pointer" onClick={() => router.push('/admin')}>
        <div className="relative">
          <div className="absolute inset-0 bg-red-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center font-black text-red-600 italic text-xl shadow-2xl">
            <Film size={20} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-[1000] uppercase italic tracking-tighter text-lg leading-none">
            A&K <span className="text-red-600">Admin</span>
          </span>
          <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">Management Hub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar py-4">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] px-4 mb-4">Main Menu</p>
        
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 translate-x-1' 
                : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon 
                  size={18} 
                  className={`${isActive ? 'text-white' : 'group-hover:text-red-600 transition-colors duration-300'}`} 
                />
                <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="animate-in fade-in slide-in-from-left-2" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - Logout */}
      <div className="p-4 mt-auto border-t border-white/5 shrink-0 bg-[#0a0a0a]">
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-white font-black uppercase italic">Server Status</span>
                    <span className="text-[8px] text-green-500 font-bold uppercase">Online</span>
                </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-3 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all bg-black/40 hover:bg-red-600 border border-white/5 rounded-2xl group shadow-inner"
            >
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              <span>Đăng xuất</span>
            </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </aside>
  );
}