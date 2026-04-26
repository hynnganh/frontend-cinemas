"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Loader2, X, Plus, Utensils, Star } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function ComboDealsSection() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await apiRequest('/api/v1/combos');
        const resData = await res.json();
        if (res.ok) setCombos(resData.data || []);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  if (loading) return (
    <div className="py-24 flex flex-col items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Loading Menu...</span>
    </div>
  );

  return (
    <section className="bg-[#050505] py-24 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="relative mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <Star size={14} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Premium Selection</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
              Combo <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Pops</span>
            </h2>
          </div>
          <p className="max-w-[280px] text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed border-l border-white/10 pl-6">
            Sự kết hợp hoàn hảo giữa vị giác và thị giác cho buổi xem phim của bặn.
          </p>
        </div>

        {/* --- MINI GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {combos.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedCombo(item)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-500 group-hover:border-red-600/50 group-hover:shadow-[0_0_40px_rgba(220,38,38,0.15)]">
                <img 
                  src={item.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={item.name} 
                />
                {/* Glass Tag */}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                   <span className="text-[10px] font-black text-white italic">{formatPrice(item.price)}đ</span>
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                   <Plus size={40} className="text-white transform scale-50 group-hover:scale-100 transition-transform duration-500" />
                </div>
              </div>
              <h4 className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-red-500 transition-colors">
                {item.name}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* --- ELITE MODAL --- */}
      {selectedCombo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-8 duration-700">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCombo(null)}
              className="absolute top-6 right-6 z-20 p-3 bg-zinc-900 hover:bg-red-600 text-white rounded-full transition-all duration-300"
            >
              <X size={20} />
            </button>

            {/* Left: Cinematic Image */}
            <div className="w-full md:w-[45%] relative group">
              <img src={selectedCombo.imageUrl} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent hidden md:block" />
            </div>

            {/* Right: Info Section */}
            <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-red-600">
                    <Utensils size={18} />
                    <div className="h-[1px] w-12 bg-red-600/30" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Detail Menu</span>
                  </div>
                  <h3 className="text-5xl md:text-6xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
                    {selectedCombo.name}
                  </h3>
                </div>

                <p className="text-sm text-zinc-500 leading-relaxed font-medium italic">
                  "{selectedCombo.description || "Một sự kết hợp tuyệt vời dành cho những tín đồ điện ảnh đích thực, mang lại hương vị khó quên."}"
                </p>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                  <div>
                    <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Giá ưu đãi</span>
                    <span className="text-4xl font-black text-white italic tracking-tighter">
                      {formatPrice(selectedCombo.price)}<span className="text-sm text-red-600 ml-1">đ</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Trạng thái</span>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Sẵn sàng
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedCombo(null)}
                    className="flex-1 py-5 bg-white text-black rounded-2xl font-[1000] uppercase text-[11px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-500 active:scale-95 shadow-xl"
                  >
                    Thưởng thức ngay
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bottom Watermark */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-16 md:translate-x-0 opacity-10">
               <span className="text-4xl font-black italic text-white tracking-tighter">A&K CINEMA</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}