"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit3, Trash2, Loader2, ImageIcon, AlertCircle, UtensilsCrossed, Sparkles } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import ComboForm from './ComboForm';

export default function FoodManagement() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/v1/combos');
      const result = await res.json();
      const rawData = result.data || result || [];
      if (Array.isArray(rawData)) {
        setCombos([...rawData].sort((a, b) => (b.id || 0) - (a.id || 0)));
      }
    } catch (error) {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCombos(); }, []);

  const handleFormSubmit = async (data: FormData) => {
    const isUpdate = !!editingItem;
    const endpoint = isUpdate ? `/api/v1/combos/${editingItem.id}` : '/api/v1/combos';
    setIsSubmitting(true);
    const toastId = toast.loading(isUpdate ? "Đang cập nhật..." : "Đang tạo...");

    try {
      const res = await apiRequest(endpoint, { method: isUpdate ? "PUT" : "POST", body: data });
      if (res.ok) {
        toast.success("Thành công!", { id: toastId });
        setIsModalOpen(false);
        fetchCombos();
      } else {
        toast.error("Thao tác thất bại", { id: toastId });
      }
    } catch (error) {
      toast.error("Lỗi hệ thống", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const toastId = toast.loading("Đang xóa...");
    try {
      const res = await apiRequest(`/api/v1/combos/${itemToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa vĩnh viễn", { id: toastId });
        setIsDeleteModalOpen(false);
        fetchCombos();
      }
    } catch {
      toast.error("Không thể xóa", { id: toastId });
    }
  };

  const filteredItems = useMemo(() => 
    combos.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())),
  [combos, searchTerm]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      <Toaster position="top-right" />

      {/* HEADER: PHONG CÁCH "SỰ KIỆN" (BANNER NGANG) */}
      <header className="bg-[#050505] border-b border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              <UtensilsCrossed className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-[1000] uppercase italic tracking-tighter text-white leading-none">Thực Đơn</h1>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1.5">Food & Combo Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-500 transition-colors" size={16} />
              <input 
                value={searchTerm || ''} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Tìm món nhanh..." 
                className="w-full bg-zinc-900/40 border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-[11px] font-bold focus:border-red-600/30 outline-none transition-all placeholder:text-zinc-700 text-white shadow-inner" 
              />
            </div>
            <button 
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }} 
              className="bg-white text-black h-[48px] px-6 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all hover:bg-red-600 hover:text-white active:scale-95 shadow-lg shrink-0 tracking-widest"
            >
              <Plus size={16} strokeWidth={3} /> Tạo mới
            </button>
          </div>
        </div>
      </header>

      {/* NỘI DUNG: QUAY LẠI DẠNG CARD GRID (NHƯ CŨ) */}
      <main className="p-6 md:p-10 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase text-zinc-700 tracking-widest italic">Syncing...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.length > 0 ? filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-zinc-900/40 hover:border-red-600/30 transition-all duration-500 shadow-xl"
              >
                {/* Ảnh sản phẩm vuông */}
                <div className="relative aspect-square overflow-hidden bg-zinc-950">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black text-[10px]">NO IMAGE</div>
                  )}
                  
                  {/* Overlay Gradient & Giá */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                    <p className="text-white font-[1000] text-lg italic tracking-tighter">
                      {(item.price || 0).toLocaleString()}<span className="text-[10px] text-red-500 ml-0.5 text-not-italic">đ</span>
                    </p>
                    <div className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white/50 group-hover:text-red-500 transition-colors">
                       <Sparkles size={12} />
                    </div>
                  </div>

                  {/* Nút xóa nhanh */}
                  <button 
                    onClick={() => { setItemToDelete(item.id!); setIsDeleteModalOpen(true); }}
                    className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md text-white/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Thông tin Text bên dưới */}
                <div className="p-5">
                  <h3 className="text-[12px] font-black uppercase italic text-zinc-100 mb-1 line-clamp-1 group-hover:text-red-500 transition-colors tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-zinc-600 text-[10px] font-bold line-clamp-1 mb-5 italic uppercase opacity-60">
                    {item.description || "Chưa có mô tả chi tiết"}
                  </p>
                  
                  <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                    className="w-full py-3 bg-zinc-800/40 hover:bg-white hover:text-black rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-zinc-900/10">
                <AlertCircle size={40} className="text-zinc-800 mb-4" />
                <p className="font-black uppercase tracking-[0.3em] text-zinc-700 text-[10px]">Danh sách trống</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
        <ComboForm 
          initialData={editingItem} 
          isSubmitting={isSubmitting} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleFormSubmit} 
        />
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-600">
              <Trash2 size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Xóa mục này?</h3>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-tight italic opacity-60 mb-8">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-zinc-900 text-zinc-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Hủy</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}