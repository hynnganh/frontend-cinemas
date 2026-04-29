"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Pencil, Upload, AlertCircle } from 'lucide-react';
import { BASE_URL } from '@/app/lib/api';
import toast from 'react-hot-toast';

interface FormProps {
  dangSua: boolean;
  idHienTai: number | null;
  duLieu: any;
  setDuLieu: (data: any) => void;
  onLuu: (formData: FormData) => void;
  onDong: () => void;
}

export default function FormBanner({ dangSua, idHienTai, duLieu, setDuLieu, onLuu, onDong }: FormProps) {
  const [anhXemTruoc, setAnhXemTruoc] = useState<string | null>(null);
  const [fileAnh, setFileAnh] = useState<File | null>(null);

  useEffect(() => {
    if (duLieu.imageUrl) {
      // Nếu là link ảnh từ bên thứ 3 hoặc từ server mình
      const url = duLieu.imageUrl.startsWith('blob') || duLieu.imageUrl.startsWith('http')
        ? duLieu.imageUrl 
        : `${BASE_URL}${duLieu.imageUrl.startsWith('/') ? '' : '/'}${duLieu.imageUrl}`;
      setAnhXemTruoc(url);
    } else {
      setAnhXemTruoc(null);
    }
  }, [duLieu.imageUrl]);

  const thayDoiFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Ràng buộc dung lượng: 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh quá nặng! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      setFileAnh(file);
      setAnhXemTruoc(URL.createObjectURL(file)); 
    }
  };

  const guiForm = (e: React.FormEvent) => {
    e.preventDefault();

    // --- RÀNG BUỘC LOGIC ---
    if (!dangSua && !fileAnh) {
      toast.error("Vui lòng tải ảnh banner lên!");
      return;
    }

    if (duLieu.title.trim().length < 5) {
      toast.error("Tiêu đề phải có ít nhất 5 ký tự.");
      return;
    }

    const data = new FormData();
    const bannerRequest = {
      title: duLieu.title.trim(),
      linkUrl: duLieu.linkUrl.trim(),
      position: duLieu.position || "HOME_TOP",
      status: duLieu.status || "ACTIVE",
      sortOrder: Math.max(0, duLieu.sortOrder || 0) // Đảm bảo không âm
    };

    data.append('banner', new Blob([JSON.stringify(bannerRequest)], { type: 'application/json' }));
    
    if (fileAnh) {
      data.append('file', fileAnh);
    }

    onLuu(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onDong} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
        </button>

        <form onSubmit={guiForm} className="p-8 space-y-6">
          <header className="border-b border-white/5 pb-4">
            <h2 className="text-sm font-black uppercase italic text-red-600 flex items-center gap-2">
              {dangSua ? <Pencil size={14} /> : <Plus size={14} />}
              {dangSua ? `Cập nhật Banner #${idHienTai}` : "Tạo Banner Chiến Dịch Mới"}
            </h2>
          </header>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex justify-between">
                Hình ảnh banner (1920x800)
                <span className="text-red-500">* Bắt buộc</span>
              </label>
              <div className="relative group aspect-video rounded-2xl border-2 border-dashed border-white/5 bg-zinc-900 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-red-600/40">
                {anhXemTruoc ? (
                  <>
                    <img src={anhXemTruoc} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2 text-zinc-700">
                    <Upload className="mx-auto" size={24} />
                    <p className="text-[9px] font-bold uppercase">Click hoặc kéo thả ảnh vào đây</p>
                    <p className="text-[8px] italic">JPG, PNG hoặc WEBP (Max 2MB)</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={thayDoiFile} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid gap-4">
              {/* Title */}
              <div className="space-y-1">
                <input 
                  required 
                  maxLength={255}
                  value={duLieu.title} 
                  onChange={e => setDuLieu({...duLieu, title: e.target.value})} 
                  placeholder="Tiêu đề banner..." 
                  className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-red-600/50 transition-all" 
                />
              </div>

              {/* Link */}
              <input 
                required 
                value={duLieu.linkUrl} 
                onChange={e => setDuLieu({...duLieu, linkUrl: e.target.value})} 
                placeholder="Đường dẫn điều hướng (URL)..." 
                className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-red-600/50 transition-all" 
              />
              
              <div className="grid grid-cols-2 gap-4">
                {/* Position */}
                <select 
                  value={duLieu.position} 
                  onChange={e => setDuLieu({...duLieu, position: e.target.value})} 
                  className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold uppercase text-white outline-none focus:border-red-600/50 cursor-pointer"
                >
                  <option value="HOME_TOP">Vị trí: Đầu trang chủ</option>
                  <option value="HOME_SIDE">Vị trí: Bên cạnh</option>
                </select>

                {/* Sort Order */}
                <div className="relative">
                    <input 
                    type="number" 
                    min="0"
                    value={duLieu.sortOrder} 
                    onChange={e => setDuLieu({...duLieu, sortOrder: parseInt(e.target.value) || 0})} 
                    className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-red-600/50" 
                    placeholder="Thứ tự..."
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-zinc-700 font-bold uppercase pointer-events-none">Ưu tiên</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-black py-4 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
          >
            <Save size={14} className="inline mr-2" /> 
            {dangSua ? "Lưu thay đổi" : "Kích hoạt Banner"}
          </button>
        </form>
      </div>
    </div>
  );
}