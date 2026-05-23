"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, ChevronDown, Bell, Ticket, UserCircle } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      title: "PHIM",
      submenu: [
        { name: "Phim Đang Chiếu", href: "/movies/now" },
        { name: "Phim Sắp Chiếu", href: "/movies/coming" },      ],
    },
    {
      title: "RẠP A&K",
      submenu: [
        { name: "Tất Cả Các Rạp", href: "/cinema" },
        { name: "Rạp Đặc Biệt (Gold Class)", href: "/cinema/special" },
        { name: "Rạp 3D / Công Nghệ Mới", href: "/cinema/3d" },
      ],
    },
    {
      title: "THÀNH VIÊN",
      submenu: [
        { name: "Tài Khoản Của Tôi", href: "/profile" },
        { name: "Quyền Lợi Thành Viên", href: "/membership" },
      ],
    },
    { title: "SỰ KIỆN", href: "/events" },
    { title: "COMBO Bắp & Nước", href: "/combos" },
    // 🎯 CHỈ THÊM ĐÚNG DÒNG NÀY ĐỂ HIỂN THỊ MENU GIỚI THIỆU
    { title: "GIỚI THIỆU", href: "/about" }, 
  ];

  return (
    <div className="w-full z-[100] relative">
      {/* --- MAIN NAVBAR --- */}
      <header
        className={`w-full transition-all duration-500 ${
          isScrolled
            ? "fixed top-0 left-0 bg-black/90 backdrop-blur-xl py-3 shadow-2xl border-b border-white/10"
            : "relative bg-black py-5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-6 md:px-12">
          
          {/* Logo Section */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-4xl font-[1000] text-red-600 tracking-tighter italic transition-transform group-hover:scale-105">
                A<span className="text-white">&</span>K
              </span>
              <span className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase mt-2 ml-1">Cinema</span>
            </Link>

            {/* Desktop Navigation */}
<nav className="hidden lg:flex gap-8 ml-4">
  {navItems.map((item) => (
    <div key={item.title} className="relative group/menu">
      {/* KIỂM TRA SUBMENU ĐỂ RENDER THẺ PHÙ HỢP */}
      {item.submenu ? (
        // Nếu có submenu: Dùng button để giữ dropdown
        <button className="flex items-center gap-1.5 text-[11px] font-black text-white/70 hover:text-white transition-all tracking-[0.2em] uppercase py-2">
          {item.title}
          <ChevronDown size={14} className="group-hover/menu:rotate-180 transition-transform duration-300 text-red-600" />
        </button>
      ) : (
        // Nếu KHÔNG có submenu (SỰ KIỆN, GIỚI THIỆU): Dùng Link để chuyển URL
        <Link 
          href={item.href || "#"} 
          className="flex items-center gap-1.5 text-[11px] font-black text-white/70 hover:text-white transition-all tracking-[0.2em] uppercase py-2"
        >
          {item.title}
        </Link>
      )}

      {/* Dropdown Menu (Chỉ render nếu có submenu) */}
      {item.submenu && (
        <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 translate-y-2 group-hover/menu:translate-y-0 z-[110]">
          <div className="bg-[#0f0f0f] border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] min-w-[240px]">
            <div className="flex flex-col gap-4">
              {item.submenu.map((sub) => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className="text-[10px] font-bold text-gray-400 hover:text-red-500 hover:translate-x-2 transition-all duration-300 uppercase tracking-widest flex items-center gap-3 group/item"
                >
                  <div className="w-1 h-1 bg-red-600 rounded-full scale-0 group-hover/item:scale-100 transition-transform" />
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  ))}
</nav>
          </div>
        </div>
      </header>
    </div>
  );
}