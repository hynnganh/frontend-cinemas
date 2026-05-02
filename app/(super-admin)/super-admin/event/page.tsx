"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Edit3, MapPin, Film, Sparkles, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PromotionModal from './EventModal';

export default function AdminPromotionManager() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<number | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/v1/promotions');
      const json = await res.json();
      const rawData = json.data?.content || json.data || json || [];
      if (Array.isArray(rawData)) {
        const sortedData = [...rawData].sort((a, b) => (b.id || 0) - (a.id || 0));
        setPromotions(sortedData);
      } else {
        setPromotions([]);
      }
    } catch (e) {
      toast.error("Không thể kết nối với máy chủ");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const executeDelete = async () => {
    if (!promoToDelete) return;
    try {
      const res = await apiRequest(`/api/v1/promotions/${promoToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa sự kiện thành công");
        fetchPromotions();
      } else {
        toast.error("Không thể xóa sự kiện này");
      }
    } catch (e) {
      toast.error("Lỗi hệ thống khi xóa");
    } finally {
      setIsDeleteModalOpen(false);
      setPromoToDelete(null);
    }
  };

  const filteredPromotions = promotions.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stripHtml = (html: string) => {
    if (!html) return "Chương trình chưa cập nhật mô tả chi tiết.";
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      <Toaster position="top-right" />
      
      <PromotionModal 
        isOpen={isModalOpen} 
        mode={modalMode} 
        data={selectedPromo}
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchPromotions} 
      />

      <header className="bg-[#050505] border-b border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-[1000] uppercase italic tracking-tighter text-white leading-none">Sự Kiện</h1>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1.5">Promotion Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-500 transition-colors" size={16} />
              <input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Tìm kiếm sự kiện..." 
                className="w-full bg-zinc-900/40 border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-[11px] font-bold focus:border-red-600/30 outline-none transition-all placeholder:text-zinc-700 text-white shadow-inner" 
              />
            </div>
            <button 
              onClick={() => { setModalMode('create'); setSelectedPromo(null); setIsModalOpen(true); }} 
              className="bg-white text-black h-[48px] px-6 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all hover:bg-red-600 hover:text-white active:scale-95 shadow-lg shrink-0 tracking-widest"
            >
              <Plus size={16} strokeWidth={3} /> Tạo mới
            </button>
          </div>
        </div>
      </header>

      {/* Main Container bám sát Header */}
      <main className="p-6 md:p-10 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase text-zinc-700 tracking-widest italic">Syncing...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredPromotions.length > 0 ? filteredPromotions.map((p) => (
              <div 
                key={p.id} 
                className="bg-zinc-950/40 border border-white/[0.03] rounded-[2.5rem] p-5 flex flex-col lg:flex-row items-center gap-6 group hover:bg-zinc-900/30 hover:border-white/[0.08] transition-all duration-500"
              >
                {/* Thumbnail */}
                <div className="w-full lg:w-64 aspect-video lg:aspect-[4/3] rounded-[1.8rem] overflow-hidden bg-zinc-900 relative shrink-0">
                  <img 
                    src={p.thumbnail?.startsWith("/") ? `${API_BASE}${p.thumbnail}` : (p.thumbnail || "https://placehold.co/600x400?text=A%26K+Cinema")} 
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    alt={p.title} 
                  />
                  <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                      <span className="text-[8px] font-black text-white italic">#ID-{p.id}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-tighter">
                      Hoạt động
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '2024'}
                    </span>
                  </div>
                  
                  <h4 className="text-xl md:text-2xl font-[1000] uppercase italic tracking-tighter text-white group-hover:text-red-500 transition-colors leading-tight">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium mt-2 line-clamp-2 leading-relaxed opacity-60">
                    {stripHtml(p.content)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-white/5 rounded-xl text-[8px] font-black uppercase text-zinc-400">
                      <MapPin size={10} className="text-red-500" /> {p.cinemaItem?.name || "Hệ Thống"}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-white/5 rounded-xl text-[8px] font-black uppercase text-zinc-400">
                      <Film size={10} className="text-red-500" /> {p.movie?.title || "Phim"}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
                  <button 
                    onClick={() => { setSelectedPromo(p); setModalMode('edit'); setIsModalOpen(true); }} 
                    className="flex-1 lg:w-12 h-12 bg-zinc-900 hover:bg-white hover:text-black rounded-2xl transition-all flex items-center justify-center border border-white/5"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => { setPromoToDelete(p.id); setIsDeleteModalOpen(true); }} 
                    className="flex-1 lg:w-12 h-12 bg-zinc-900 hover:bg-red-600 hover:text-white rounded-2xl transition-all flex items-center justify-center border border-white/5 text-zinc-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-zinc-900/10">
                <AlertCircle size={40} className="text-zinc-800 mb-4" />
                <p className="font-black uppercase tracking-[0.3em] text-zinc-700 text-[10px]">Trống</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Modal giữ nguyên logic nhưng làm gọn UI */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] max-w-sm w-full text-center">
            <Trash2 size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-black uppercase italic tracking-tighter">Xác nhận xóa?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-zinc-900 rounded-xl font-black uppercase text-[10px]">Hủy</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-red-600 rounded-xl font-black uppercase text-[10px]">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}