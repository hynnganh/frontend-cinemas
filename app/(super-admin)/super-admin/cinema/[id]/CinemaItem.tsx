"use client";
import { useState, useEffect } from 'react';
import { X, Loader2, Save, PlusCircle } from 'lucide-react';
import { apiSuperAdminRequest } from '@/app/lib/api';
import toast from 'react-hot-toast';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  cinemaId: number;
  onSuccess: () => void;
  initialData?: any;
}

export default function AddCinemaItemModal({ isOpen, onClose, cinemaId, onSuccess, initialData }: AddModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    hoursPerRoom: 0,
    cinemaId: cinemaId
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        city: initialData.city || '',
        hoursPerRoom: initialData.hoursPerRoom || 0,
        cinemaId: cinemaId
      });
    } else {
      setFormData({ name: '', address: '', city: '', hoursPerRoom: 0, cinemaId });
    }
  }, [initialData, isOpen, cinemaId]);

  if (!isOpen) return null;

  const isEdit = !!initialData; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const url = isEdit 
        ? `/api/v1/cinema-items/${initialData.id}` 
        : `/api/v1/cinema-items`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiSuperAdminRequest(url, {
        method: method,
        body: JSON.stringify({ ...formData, cinemaId }) 
      });

      if (res.ok) {
        toast.success(isEdit ? "Cập nhật dữ liệu thành công" : "Khởi tạo đơn vị thành công");
        onSuccess();
        onClose();
      } else {
        toast.error("Có lỗi xảy ra từ phía máy chủ");
      }
    } catch (err) {
      toast.error("Lỗi kết nối API");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isEdit ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">
              {isEdit ? 'Cấu hình đơn vị' : 'Khởi tạo đơn vị mới'}
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">Tên phòng (Name)</label>
            <input 
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
              placeholder="VD: Rạp A&K - Tên đường"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">Địa chỉ chi tiết</label>
            <input 
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
              placeholder="Số nhà, tên đường..."
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">Khu vực</label>
            <input 
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
              placeholder="Tên thành phố"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">Slot hoạt động</label>
            <input 
              type="number"
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all"
              value={formData.hoursPerRoom}
              onChange={(e) => setFormData({...formData, hoursPerRoom: Number(e.target.value)})}
              required
            />
          </div>

          {/* Nút hành động thay đổi giao diện theo mode */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`col-span-2 mt-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
              isEdit 
                ? 'bg-amber-500 text-black hover:bg-amber-400' 
                : 'bg-white text-black hover:bg-red-600 hover:text-white'
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                {isEdit ? <Save size={14} /> : <PlusCircle size={14} />}
                {isEdit ? "Cập nhật dữ liệu" : "Xác nhận tạo mới"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}