"use client";
import React, { useState } from 'react';
import { X, Save, UploadCloud, Loader2, ChevronRight, Package, CircleDollarSign, Info } from 'lucide-react';

interface ComboFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function ComboForm({ initialData, onSubmit, onClose, isSubmitting }: ComboFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.imageUrl || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("combo", new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    if (imageFile) data.append("file", imageFile);
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Lớp nền mờ */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      {/* Khung Form */}
      <div className="relative bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] w-full max-w-xl shadow-[0_0_100px_-20px_rgba(220,38,38,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              {initialData ? 'Chỉnh sửa' : 'Thêm'} <span className="text-red-600">Combo</span>
            </h2>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em]">Cập nhật thông tin thực đơn</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-white transition-all"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* TẢI ẢNH */}
          <div className="flex items-center gap-6 p-4 bg-zinc-900/30 rounded-[2rem] border border-white/5">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden shrink-0 group hover:border-red-600/50 transition-all">
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setImageFile(file); setPreview(URL.createObjectURL(file)); }
              }} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <UploadCloud className="text-zinc-700 group-hover:text-red-500 transition-colors" size={28} />
              )}
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Ảnh minh họa</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">Hỗ trợ PNG, JPG. <br/>Tỉ lệ đề nghị 1:1.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><Package size={12}/> Tên Combo</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-red-600 transition-all text-white" placeholder="Ví dụ: Combo Bắp Nước" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><CircleDollarSign size={12}/> Giá bán (VND)</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-sm font-black outline-none focus:border-red-600 transition-all text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><Info size={12}/> Mô tả sản phẩm</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-sm font-medium outline-none focus:border-red-600 transition-all resize-none text-white" placeholder="Chi tiết gồm những gì..." />
          </div>

          <button 
            disabled={isSubmitting} 
            type="submit" 
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white rounded-xl font-black uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-600/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Lưu thực đơn
          </button>
        </form>
      </div>
    </div>
  );
}