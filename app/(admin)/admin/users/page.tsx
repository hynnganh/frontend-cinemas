"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Loader2, RefreshCw, 
  User, Calendar, ChevronRight, Mail, Ticket
} from 'lucide-react';
import { apiAdminRequest } from '@/app/lib/api'; 
import toast, { Toaster } from 'react-hot-toast';

export default function TrangQuanLyKhachHang() {
  const [danhSachKhach, setDanhSachKhach] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const layDuLieu = async () => {
    try {
      setDangTai(true);
      const res = await apiAdminRequest('/api/v1/tickets'); 
      const ketQua = await res.json();
      
      if (res.ok && Array.isArray(ketQua.data)) {
        const mapKhachHang = new Map();
        ketQua.data.forEach((ticket: any) => {
          const u = ticket.user;
          if (u?.userId) {
            if (!mapKhachHang.has(u.userId)) {
              mapKhachHang.set(u.userId, { 
                ...u, 
                count: 0, 
                total: 0, 
                first: ticket.createdAt || new Date().toISOString() 
              });
            }
            const cur = mapKhachHang.get(u.userId);
            cur.count += 1;
            cur.total += Number(ticket.price) || 0;
          }
        });
        setDanhSachKhach(Array.from(mapKhachHang.values()));
      }
    } catch (err) {
      toast.error("Lỗi đồng bộ dữ liệu!");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => { layDuLieu(); }, []);

  const filtered = danhSachKhach.filter(k => 
    `${k.firstName} ${k.lastName} ${k.email}`.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-400 p-8 font-sans selection:bg-red-500/30">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* --- HEADER THEO STYLE A&K --- */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-10 bg-red-600 rounded-full" />
             <div>
                <h1 className="text-3xl font-[1000] text-white tracking-tighter italic uppercase leading-none">
                  KHÁCH HÀNG <span className="text-red-600 font-black">HỆ THỐNG</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mt-1">A&K Cinema Management</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Tìm tên, mã khách, email..." 
                className="bg-[#0f0f0f] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold outline-none focus:border-red-600/30 transition-all w-72 placeholder:text-zinc-800"
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
              />
            </div>
            <button onClick={layDuLieu} className="p-3 bg-[#0f0f0f] border border-white/5 rounded-2xl hover:bg-zinc-900 transition-all active:scale-95">
              <RefreshCw size={18} className={dangTai ? "animate-spin text-red-600" : "text-zinc-600"} />
            </button>
          </div>
        </header>

        {/* --- LIST LAYOUT (STYLE PHÒNG CHIẾU) --- */}
        <div className="space-y-3">
          {/* Header Row */}
          <div className="px-8 py-2 flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-800">
            <div className="w-16">ID</div>
            <div className="flex-1">Thông tin thành viên</div>
            <div className="w-32 hidden md:block text-center">Gia nhập</div>
            <div className="w-24 text-center">Số vé</div>
            <div className="w-32 text-right">Tổng chi</div>
            <div className="w-12"></div>
          </div>

          {dangTai ? (
            <div className="py-40 text-center">
              <Loader2 className="animate-spin mx-auto text-red-600 mb-4" size={40} />
              <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest italic">Đang bóc tách dữ liệu...</p>
            </div>
          ) : (
            filtered.map((khach) => (
              <div 
                key={khach.userId} 
                className="group flex items-center px-8 py-5 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] hover:bg-[#0f0f0f] hover:border-red-600/20 transition-all duration-300 cursor-pointer"
              >
                {/* ID - Mono Style */}
                <div className="w-16 text-[11px] font-black text-zinc-800 group-hover:text-red-600/40 transition-colors tracking-tighter italic">
                  #{khach.userId}
                </div>

                {/* Member Info */}
                <div className="flex-1 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-black border border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-red-600/30 transition-all shadow-2xl">
                    {khach.avatar ? (
                      <img src={khach.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-[1000] text-zinc-200 uppercase italic tracking-tighter leading-none group-hover:text-white transition-colors">
                      {khach.firstName} {khach.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Mail size={10} className="text-red-600" />
                      <p className="text-[10px] text-zinc-500 font-bold tracking-tight truncate">{khach.email}</p>
                    </div>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="w-32 hidden md:flex items-center justify-center gap-2 text-[11px] font-black text-zinc-700 uppercase italic">
                  {new Date(khach.first).toLocaleDateString('vi-VN')}
                </div>

                {/* Ticket Count - Badge Red Style */}
                <div className="w-24 text-center">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/5 border border-red-600/10 rounded-full">
                      <Ticket size={10} className="text-red-600" />
                      <span className="text-[11px] font-black text-red-600 italic">
                        {khach.count}
                      </span>
                   </div>
                </div>

                {/* Total Spent */}
                <div className="w-32 text-right">
                  <p className="text-lg font-[1000] text-white italic tracking-tighter">
                    {(Number(khach.total) || 0).toLocaleString()}
                    <span className="text-[10px] ml-1 text-red-600 not-italic uppercase font-black">đ</span>
                  </p>
                </div>

                {/* Action Arrow */}
                <div className="w-12 flex justify-end">
                   <div className="w-10 h-10 rounded-2xl bg-[#080808] border border-white/5 flex items-center justify-center text-zinc-800 group-hover:text-white group-hover:bg-red-600 group-hover:border-red-600 transition-all shadow-xl group-hover:translate-x-1">
                      <ChevronRight size={18} />
                   </div>
                </div>
              </div>
            ))
          )}

          {!dangTai && filtered.length === 0 && (
            <div className="py-40 text-center border border-dashed border-white/5 rounded-[3rem]">
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-800 italic">No Member Records Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}