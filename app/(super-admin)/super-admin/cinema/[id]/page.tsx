"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/app/lib/api';
import { 
  Loader2, Clapperboard, 
  ArrowLeft, Plus, 
  ChevronRight, Trash2, Edit3, AlertTriangle 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AddCinemaItemModal from './CinemaItem';

// --- MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mb-8 border border-red-600/20 shadow-inner">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase italic mb-3 tracking-tight text-white">Xóa mục này?</h2>
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-10 text-center">
            Dữ liệu về <span className="text-red-500">"{title}"</span> sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>
          <div className="flex w-full gap-4">
            <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-zinc-900 text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all">Hủy</button>
            <button onClick={onConfirm} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CinemaDetailPage() {
  const params = useParams();
  const id = params?.id; // Cinema ID từ URL
  const router = useRouter();
  
  const [cinema, setCinema] = useState<any>(null);
  const [cinemaItems, setCinemaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState<any>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [resC, resI] = await Promise.all([
        apiRequest(`/api/v1/cinemas/${id}`),
        apiRequest(`/api/v1/cinema-items`)
      ]);
      const dataC = await resC.json();
      const dataI = await resI.json();
      
      setCinema(dataC.data || dataC);
      
      // Lọc các CinemaItems thuộc Cinema này
      const allItems = dataI.data || dataI;
      const filteredItems = Array.isArray(allItems) 
        ? allItems.filter((i: any) => i.cinemaId === Number(id) || i.cinema?.id === Number(id))
        : [];
        
      setCinemaItems(filteredItems);
    } catch (err) { 
      toast.error("Lỗi đồng bộ dữ liệu hệ thống"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiRequest(`/api/v1/cinema-items/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa thành công");
        setDeleteTarget(null);
        fetchData();
      }
    } catch (err) { 
      toast.error("Thao tác thất bại"); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-red-600/20 animate-pulse" />
        <Loader2 className="animate-spin text-red-600 relative" size={44} />
      </div>
      <span className="text-[10px] font-black tracking-[0.5em] uppercase text-zinc-600 italic">Syncing Core Data...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-3 md:p-6 font-sans selection:bg-red-600 overflow-hidden relative">
      <Toaster position="top-right" />
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <button onClick={() => router.back()} className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all mb-10 text-[10px] font-black uppercase tracking-widest">
          <div className="p-2 border border-white/5 rounded-full group-hover:border-white/20 transition-colors"><ArrowLeft size={14} /></div>
          Trở lại hệ thống
        </button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-red-500">ROOT_ID: #{id}</span>
              <p className="text-zinc-500 font-bold text-[9px] uppercase tracking-[0.3em]">Infrastructure Node</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
              {cinema?.name || "Cinema Detail"}
            </h1>
          </div>
          
          <button onClick={() => setModalData(null)} className="group px-8 py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
            Thêm đơn vị mới
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cinemaItems.map((item) => (
            <div 
              key={item.id} 
              // Sửa điều hướng để khớp với folder room/[id] của bà
              onClick={() => router.push(`/super-admin/room/${item.id}`)}
              className="group relative bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 transition-all hover:border-red-600/40 hover:-translate-y-2 duration-500 cursor-pointer overflow-hidden shadow-2xl"
            >
              <div className="absolute top-4 right-8 text-6xl font-black text-white/[0.02] italic group-hover:text-red-600/[0.05] transition-colors">#0{item.id}</div>
              
              <div className="flex justify-between items-start mb-14 relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-xl">
                  <Clapperboard size={24} />
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setModalData(item); }} 
                    className="p-3 bg-zinc-900 border border-white/5 hover:bg-white hover:text-black rounded-2xl transition-all shadow-xl"
                  >
                    <Edit3 size={16}/>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }} 
                    className="p-3 bg-zinc-900 border border-white/5 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-xl"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>

              <div className="space-y-6 mb-10 relative z-10">
                <h3 className="text-2xl font-black uppercase italic leading-none group-hover:text-red-500 transition-colors">{item.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Khu vực</p>
                    <p className="text-[10px] text-zinc-300 font-bold uppercase truncate">{item.city}</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Capacity</p>
                    <p className="text-[10px] text-zinc-300 font-bold uppercase">{item.hoursPerRoom}H/D</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center group-hover:border-red-600/20 transition-colors relative z-10">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors italic">Vào quản lý danh sách phòng</span>
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}

          {cinemaItems.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.4em] italic">Node Empty - Chờ khởi tạo đơn vị cơ sở</p>
            </div>
          )}
        </div>
      </div>

      <AddCinemaItemModal 
        isOpen={modalData !== undefined} 
        onClose={() => setModalData(undefined)} 
        cinemaId={Number(id)} 
        onSuccess={fetchData} 
        initialData={modalData}
      />

      <ConfirmDeleteModal 
        isOpen={!!deleteTarget} 
        title={deleteTarget?.name} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete} 
      />
    </div>
  );
}