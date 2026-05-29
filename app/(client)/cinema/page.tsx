"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, MapPin, Clock, Lock } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

// Định nghĩa các loại phòng đặc biệt (Thêm cờ isComingSoon)
const CATEGORIES = [
  {
    id: "IMAX",
    title: "IMAX",
    desc: "Màn hình cong khổng lồ, âm thanh vòm sống động. Công nghệ điện ảnh tân tiến nhất.",
    img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000",
    badge: "Công nghệ",
    isComingSoon: true, // Khóa rạp này
  },
  {
    id: "VIP",
    title: "PHÒNG CLASSIC",
    desc: "Ghế bọc da cao cấp, có đa dạng các loại ghế như: ghế thường, ghế cao cấp, ghế VIP.",
    img: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=1000",
    badge: "Phong cách",
    isComingSoon: false, // Mở rạp này
  },
  {
    id: "COUPLE",
    title: "GHẾ ĐÔI SWEETBOX",
    desc: "Không gian riêng tư tuyệt đối dành riêng cho các cặp đôi.",
    img: "https://images.unsplash.com/photo-1543536448-d247542f576c?q=80&w=1000",
    badge: "Phong cách",
    isComingSoon: true, // Khóa rạp này
  }
];

export default function SpecialCinemasPage() {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await apiRequest('/api/v1/cinema-items');
        const result = await res.json();
        setCinemas(result.data || []);
      } catch (e) {
        console.error("Lỗi lấy danh sách rạp:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  // Hàm lấy tất cả các TÊN CHI NHÁNH RẠP CHA (duy nhất)
  const getUniqueParentCinemas = () => {
    const parentNames = cinemas.map(c => c.cinema?.name || c.name);
    // Dùng Set để lọc trùng lặp (ví dụ có 3 chi nhánh ở HCM thì chỉ hiện "A&K HCM" 1 lần)
    return Array.from(new Set(parentNames));
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  }

  const parentCinemasList = getUniqueParentCinemas();

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* HEADER */}
        <header className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-[1000] italic uppercase tracking-tighter leading-tight">
            Thế giới điện ảnh <br /> 
            <span className="text-red-600 underline decoration-white/10 underline-offset-8">đỉnh cao tại A&K</span>
          </h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">
            Trải nghiệm không gian giải trí đẳng cấp
          </p>
        </header>

        {/* CÁC PHÒNG ĐẶC BIỆT */}
        <div className="space-y-16">
          {CATEGORIES.map((cat, i) => {
            return (
              <div key={i} className={`flex flex-col md:flex-row gap-8 items-center bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 lg:p-8 transition-colors ${cat.isComingSoon ? 'opacity-75 grayscale-[0.5]' : 'hover:border-white/10'}`}>
                
                {/* Ảnh minh hoạ */}
                <div className="w-full md:w-5/12 h-[250px] shrink-0 rounded-[1.5rem] overflow-hidden relative">
                  <img src={cat.img} className="w-full h-full object-cover" alt={cat.title} />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-600/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {cat.badge}
                  </div>
                  {/* Overlay đen nếu là Coming Soon */}
                  {cat.isComingSoon && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-black/80 px-4 py-2 rounded-xl text-yellow-500 font-black tracking-widest text-xs uppercase border border-yellow-500/20 flex items-center gap-2">
                        <Clock size={14} /> Coming Soon
                      </div>
                    </div>
                  )}
                </div>

                {/* Nội dung */}
                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter flex items-center gap-3">
                      {cat.title}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-2">{cat.desc}</p>
                  </div>

                  {/* Danh sách rạp */}
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-4 min-h-[80px] flex flex-col justify-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5">
                      <MapPin size={12} /> CÁC CHI NHÁNH ĐANG PHỤC VỤ:
                    </h3>
                    
                    {cat.isComingSoon ? (
                      <div className="text-xs text-yellow-500 italic font-medium flex items-center gap-2">
                         Dự kiến ra mắt trong quý tới...
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {parentCinemasList.length > 0 ? (
                          parentCinemasList.map((name, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-zinc-300">
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500 italic">Đang cập nhật danh sách rạp...</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 🎯 XỬ LÝ NÚT BẤM (MỞ HAY KHÓA) */}
                  {cat.isComingSoon ? (
                    <button 
                      disabled
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900/50 text-zinc-600 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
                    >
                      Sắp ra mắt <Lock size={14} />
                    </button>
                  ) : (
                    <Link 
                      href="/cinema" 
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all group"
                    >
                      Đến trang đặt vé <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
