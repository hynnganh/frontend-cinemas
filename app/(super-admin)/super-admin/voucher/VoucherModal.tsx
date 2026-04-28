"use client";
import React, { useEffect, useState } from 'react';
import { X, Save, Loader2, Calendar, Tag, DollarSign, Activity, ChevronDown, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import toast from 'react-hot-toast';

export default function VoucherModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }: any) {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    code: "", 
    title: "", 
    description: "", 
    discountValue: 0,
    minOrderAmount: 0, 
    usageLimit: 1,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    cinemaItemId: "", 
    promotionId: ""
  });

  // Fetch dữ liệu bổ trợ
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [promoRes, cinemaRes] = await Promise.all([
            apiRequest('/api/v1/promotions'),
            apiRequest('/api/v1/cinema-items')
          ]);
          if (promoRes.ok) setPromotions((await promoRes.json()).data || []);
          if (cinemaRes.ok) setCinemas((await cinemaRes.json()).data || []);
        } catch (error) { console.error(error); } 
        finally { setLoadingData(false); }
      };
      fetchData();
    }
  }, [isOpen]);

  // Sync dữ liệu khi Edit/Create
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          startDate: new Date(initialData.startDate).toISOString().slice(0, 16),
          endDate: new Date(initialData.endDate).toISOString().slice(0, 16),
          cinemaItemId: initialData.cinemaItem?.id || initialData.cinemaItemId || "",
          promotionId: initialData.promotion?.id || initialData.promotionId || ""
        });
      } else {
        setFormData({
          code: "", title: "", description: "", discountValue: 0,
          minOrderAmount: 0, usageLimit: 1,
          startDate: new Date().toISOString().slice(0, 16),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          cinemaItemId: "", promotionId: ""
        });
      }
    }
  }, [initialData, isOpen]);

  // --- HỆ THỐNG RÀNG BUỘC (VALIDATION) ---
  const isTimeInvalid = new Date(formData.endDate) <= new Date(formData.startDate);
  const isDiscountInvalid = formData.discountValue <= 0;
  const isCodeEmpty = !formData.code.trim();
  
  // Nút submit chỉ enable khi thỏa mãn tất cả điều kiện
  const canSubmit = !isTimeInvalid && !isDiscountInvalid && !isCodeEmpty && !isSubmitting;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#0d0d0d] border border-white/10 p-8 rounded-[2.5rem] max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {initialData ? 'Update' : 'New'} <span className="text-red-600">Voucher</span>
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-red-600 transition-all"><X size={18} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if(canSubmit) onSubmit(formData); }} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-2"><Tag size={12} /> Mã Code</label>
              <input 
                name="code" required 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className={`w-full bg-zinc-900 border ${isCodeEmpty ? 'border-red-500/50' : 'border-white/5'} p-3.5 rounded-xl text-white text-sm font-bold outline-none focus:border-red-600 transition-all`} 
                placeholder="VD: GIAM50K" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-2"><Activity size={12} /> Giới hạn</label>
              <input 
                name="usageLimit" type="number" required 
                value={formData.usageLimit} onChange={handleChange}
                className="w-full bg-zinc-900 border border-white/5 p-3.5 rounded-xl text-white text-sm font-bold outline-none focus:border-red-600" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Tiêu đề hiển thị</label>
            <input 
              name="title" required 
              value={formData.title} onChange={handleChange}
              className="w-full bg-zinc-900 border border-white/5 p-3.5 rounded-xl text-white text-sm font-bold outline-none focus:border-red-600" 
              placeholder="Nhập tên chương trình khuyến mãi..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-2"><DollarSign size={12} className="text-red-600"/> Số tiền giảm</label>
              <input 
                name="discountValue" type="number" required 
                value={formData.discountValue} onChange={handleChange}
                className={`w-full bg-zinc-900 border ${isDiscountInvalid ? 'border-red-500/50' : 'border-white/5'} p-3.5 rounded-xl text-white text-sm font-bold outline-none focus:border-red-600`} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Đơn tối thiểu</label>
              <input 
                name="minOrderAmount" type="number" required 
                value={formData.minOrderAmount} onChange={handleChange}
                className="w-full bg-zinc-900 border border-white/5 p-3.5 rounded-xl text-white text-sm font-bold outline-none focus:border-red-600" 
              />
            </div>
          </div>

          {/* Thời gian - Có báo lỗi trực quan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Ngày bắt đầu</label>
              <input 
                name="startDate" type="datetime-local" required 
                value={formData.startDate} onChange={handleChange}
                className="w-full bg-zinc-900 border border-white/5 p-3 rounded-xl text-[11px] text-white font-bold outline-none focus:border-red-600" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Ngày kết thúc</label>
              <input 
                name="endDate" type="datetime-local" required 
                value={formData.endDate} onChange={handleChange}
                className={`w-full bg-zinc-900 border ${isTimeInvalid ? 'border-red-500' : 'border-white/5'} p-3 rounded-xl text-[11px] text-white font-bold outline-none transition-colors`} 
              />
            </div>
          </div>

          {/* Thông báo lỗi nếu có */}
          {isTimeInvalid && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14} />
              <p className="text-[10px] font-black uppercase">Lỗi: Thời gian kết thúc không hợp lệ!</p>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={!canSubmit}
              className="w-full bg-white disabled:bg-zinc-800 text-black disabled:text-zinc-600 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {initialData ? "Lưu cập nhật" : "Xác nhận tạo"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}