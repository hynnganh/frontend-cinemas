"use client";
import React, { useState, useEffect } from 'react';
import { 
  Loader2, Plus, Building2, ChevronRight, 
  Fingerprint, Edit3, Trash2, 
  AlertTriangle, LayoutGrid 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { apiSuperAdminRequest } from '@/app/lib/api'; 
import AddCinemaModal from './AddCinemaModal';

// --- MODAL XÁC NHẬN XÓA TÙY CHỈNH ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#0f0f0f] border border-zinc-900 w-full max-w-[380px] rounded-xl p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto w-12 h-12 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center text-red-500">
          <AlertTriangle size={20} />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-base font-bold uppercase text-white tracking-tight">Gỡ bỏ chi nhánh?</h2>
          <p className="text-xs text-zinc-500 font-medium px-2 leading-relaxed">
            Dữ liệu của cụm rạp <span className="text-zinc-200 font-semibold">"{title}"</span> sẽ bị xóa vĩnh viễn khỏi hệ thống hiển thị.
          </p>
        </div>

        <div className="flex w-full gap-2.5 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 bg-zinc-950 border border-zinc-900 py-3 rounded-lg text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300 transition"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 bg-red-600 text-white py-3 rounded-lg text-[10px] font-bold uppercase hover:bg-red-700 transition"
          >
            Xác nhận xóa
          </button>
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
      const res = await apiSuperAdminRequest('/api/v1/cinemas');
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
    const t = toast.loading("Đang tiến hành gỡ bỏ...");
    try {
      const res = await apiSuperAdminRequest(`/api/v1/cinemas/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa thành công", { id: t });
        setDeleteTarget(null);
        fetchCinemas();
      } else {
        throw new Error();
      }
    } catch (err) { 
      toast.error("Không thể xóa dữ liệu", { id: t }); 
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px'
          },
        }} 
      />
      
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

      {/* HEADER CHUẨN HOÁ */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-6 mb-10 gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Chi nhánh <span className="text-red-600">Cinema</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <LayoutGrid size={10} className="text-zinc-600" /> Phân hệ quản lý rạp chiếu
          </p>
        </div>
        
        <button 
          onClick={() => setModalItem(null)}
          className="bg-white text-black px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] shadow-sm flex items-center gap-2"
        >
          <Plus size={14} /> 
          Thêm cơ sở
        </button>
      </header>

      {/* DANH SÁCH RẠP */}
      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-red-600 opacity-80" size={28} />
            <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase animate-pulse">Đang đồng bộ cơ sở dữ liệu...</span>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => router.push(`/super-admin/cinema/${item.id}`)}
                className="group relative bg-[#060608] border border-zinc-900 rounded-xl p-6 transition-all hover:border-red-600/20 cursor-pointer overflow-hidden shadow-md flex flex-col justify-between"
              >
                {/* ID Mờ góc phải */}
                <span className="absolute top-3 right-4 text-3xl font-black text-white/[0.01] group-hover:text-red-600/[0.04] transition-colors tracking-tighter">
                  {String(item.id).padStart(2, '0')}
                </span>

                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="w-11 h-11 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-red-600 group-hover:border-transparent transition-all duration-300 shadow-inner">
                    <Building2 size={18} />
                  </div>
                  
                  {/* Nhóm nút Thao tác tinh chỉnh mượt mà */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setModalItem(item); }} 
                      className="p-2 bg-zinc-950 hover:bg-white hover:text-black border border-zinc-900 rounded-md transition-all shadow-md"
                    >
                      <Edit3 size={12}/>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }} 
                      className="p-2 bg-zinc-950 hover:bg-red-600 hover:text-white border border-zinc-900 hover:border-transparent rounded-md transition-all shadow-md"
                    >
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-lg font-bold uppercase text-zinc-200 group-hover:text-white transition-colors duration-200 tracking-tight truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-900/60">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      Đang hoạt động
                    </span>
                    <ChevronRight size={12} className="ml-auto text-zinc-600 group-hover:text-red-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-zinc-900 border-dashed bg-zinc-950/40 rounded-xl">
            <Fingerprint className="mx-auto mb-3 text-zinc-800" size={36} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Hệ thống chưa thiết lập chi nhánh nào</p>
          </div>
        )}
      </main>
    </div>
  );
}