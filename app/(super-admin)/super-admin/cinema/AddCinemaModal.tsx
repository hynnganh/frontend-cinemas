"use client";
import React, { useState, useEffect } from 'react';
import { X, Zap, ChevronRight, Loader2, Building2, MapPin, Info, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiSuperAdminRequest } from '@/app/lib/api';

interface AddCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // Dữ liệu truyền vào khi Sửa
}

// FIX: Thêm initialData vào phần destructuring ở đây
export default function AddCinemaModal({ isOpen, onClose, onSuccess, initialData }: AddCinemaModalProps) {
  const [cinemaName, setCinemaName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIC: Tự động điền dữ liệu khi ở chế độ "Sửa"
  useEffect(() => {
    if (initialData && isOpen) {
      setCinemaName(initialData.name || "");
    } else if (isOpen) {
      setCinemaName(""); // Reset nếu là "Thêm mới"
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinemaName.trim()) return;

    setIsSubmitting(true);
    const mode = initialData ? "Cập nhật" : "Khởi tạo";
    const loadingToast = toast.loading(`Đang ${mode} hệ thống...`);

    try {
      // LOGIC: Nếu có initialData thì dùng PUT và truyền ID, ngược lại dùng POST
      const url = initialData ? `/api/v1/cinemas/${initialData.id}` : '/api/v1/cinemas';
      const method = initialData ? 'PUT' : 'POST';

      const res = await apiSuperAdminRequest(url, {
        method: method,
        body: JSON.stringify({ 
          name: cinemaName,
          address: initialData?.address || "Quận", // Giữ lại địa chỉ cũ nếu có
          city: "TP. Hồ Chí Minh",
          description: "Dữ liệu được cập nhật từ Admin"
        })
      });

      if (res.ok) {
        toast.success(`${mode} thành công: ${cinemaName}`, { id: loadingToast });
        setCinemaName("");
        onSuccess(); 
        onClose();   
      } else {
        const result = await res.json();
        toast.error(result.message || "Thao tác thất bại!", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Lỗi kết nối Server!", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[450px] bg-[#080808] border-l border-white/10 h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Đổi title linh hoạt */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              {initialData ? <Save size={20} /> : <Zap size={20} className="fill-white" />}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                {initialData ? "Edit Node" : "New Node"}
              </h2>
              <p className="text-[9px] font-bold text-red-600 uppercase tracking-[0.3em]">
                {initialData ? `Đang chỉnh sửa ID: ${initialData.id}` : "Cấu hình rạp mới"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                <Building2 size={12} className="text-red-600" /> Tên chi nhánh
              </label>
              <div className="relative group">
                <input 
                  autoFocus
                  type="text"
                  placeholder="VD: Quận 1 - Center" 
                  value={cinemaName}
                  disabled={isSubmitting}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-lg font-bold text-white outline-none focus:border-red-600/50 focus:bg-white/[0.05] transition-all"
                  onChange={e => setCinemaName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Thông tin mô phỏng */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-2 mb-1">
                  <MapPin size={10} /> Network
                </p>
                <p className="text-xs font-bold text-zinc-300 italic">TP. Hồ Chí Minh</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-2 mb-1">
                  <Info size={10} /> Mode
                </p>
                <p className="text-xs font-bold text-red-500 italic">
                  {initialData ? "Override" : "Fresh Install"}
                </p>
              </div>
            </div>

            <div className="pt-10">
              <button 
                type="submit" 
                disabled={!cinemaName.trim() || isSubmitting}
                className="w-full group bg-white text-black py-6 rounded-2xl font-[1000] uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-red-600 hover:text-white active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {initialData ? "Lưu thay đổi" : "Khởi tạo chi nhánh"} 
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-white/5 bg-black/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-600/10 rounded-lg">
              <ShieldCheck size={16} className="text-red-600" />
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
              Dữ liệu sẽ được lưu trữ vĩnh viễn trên Server Cluster. Hãy kiểm tra kỹ tên định danh trước khi xác nhận.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}