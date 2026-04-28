"use client";
import React, { useState, useEffect } from 'react';
import { 
  Loader2, Plus, Building2, ChevronRight, 
  Fingerprint, Edit3, Trash2, 
  AlertTriangle, X, LayoutGrid 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { apiRequest } from '@/app/lib/api'; 
import AddCinemaModal from './AddCinemaModal';

// --- MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] border border-white/5 w-full max-w-[380px] rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 border border-red-600/20">
            <AlertTriangle className="text-red-600" size={28} />
          </div>
          <h2 className="text-xl font-black uppercase italic mb-3 tracking-tighter">Gỡ bỏ chi nhánh?</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 px-4">
            Dữ liệu của <span className="text-white italic">"{title}"</span> sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>
          <div className="flex w-full gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-zinc-500 font-black uppercase text-[9px] tracking-widest hover:bg-zinc-800 transition-all">
              Hủy
            </button>
            <button onClick={onConfirm} className="flex-1 py-3.5 rounded-xl bg-red-600 text-white font-black uppercase text-[9px] tracking-widest hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all">
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function CinemaPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState<any>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/v1/cinemas');
      const result = await res.json();
      setItems(Array.isArray(result.data || result) ? (result.data || result) : []);
    } catch (err) {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCinemas(); }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiRequest(`/api/v1/cinemas/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa thành công");
        setDeleteTarget(null);
        fetchCinemas();
      }
    } catch (err) { toast.error("Không thể xóa dữ liệu"); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 font-sans selection:bg-red-600">
      <Toaster position="top-right" />
      
      <AddCinemaModal 
        isOpen={modalItem !== undefined} 
        onClose={() => setModalItem(undefined)} 
        onSuccess={fetchCinemas} 
        initialData={modalItem} 
      />

      <ConfirmDeleteModal 
        isOpen={!!deleteTarget}
        title={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* HEADER TỐI GIẢN */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <LayoutGrid size={14} className="text-red-600" />
            <p className="text-zinc-500 font-black text-[9px] uppercase tracking-[0.4em]">Quản lý rạp chiếu</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none">
            Chi nhánh <span className="text-red-600">Cinema</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setModalItem(null)}
          className="group px-8 py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> 
          Thêm cơ sở
        </button>
      </header>

      {/* DANH SÁCH RẠP */}
      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-red-600" size={32} />
            <span className="text-[9px] font-black tracking-[0.5em] text-zinc-600 uppercase">Synchronizing...</span>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => router.push(`/super-admin/cinema/${item.id}`)}
                className="group relative bg-zinc-900/20 border border-white/5 rounded-[2rem] p-8 transition-all hover:border-red-600/50 hover:bg-zinc-900/40 cursor-pointer overflow-hidden shadow-2xl"
              >
                {/* ID Background mờ */}
                <span className="absolute top-4 right-8 text-5xl font-black text-white/[0.02] italic group-hover:text-red-600/[0.05] transition-colors">
                  {String(item.id).padStart(2, '0')}
                </span>

                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-red-600 group-hover:scale-110 transition-all duration-500 shadow-inner">
                    <Building2 size={24} />
                  </div>
                  <div className="flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setModalItem(item); }} 
                      className="p-3 bg-white/5 hover:bg-white hover:text-black rounded-xl transition-all shadow-xl"
                    >
                      <Edit3 size={14}/>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }} 
                      className="p-3 bg-white/5 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-xl"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter group-hover:text-red-500 transition-colors duration-300">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      Đang hoạt động
                    </span>
                    <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/5 bg-zinc-900/10 rounded-[3rem] border-dashed">
            <Fingerprint className="mx-auto mb-4 text-zinc-800" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Chưa có dữ liệu chi nhánh</p>
          </div>
        )}
      </main>
    </div>
  );
}