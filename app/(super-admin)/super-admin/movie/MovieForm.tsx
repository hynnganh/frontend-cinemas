"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Film, Upload, Star, Clock, Calendar, Users, Globe, Youtube } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiSuperAdminRequest, getImageUrl } from '@/app/lib/api';

interface MovieFormProps {
  initialData?: any;
  type: 'create' | 'edit';
}

export default function MovieForm({ initialData, type }: MovieFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- FIX 1: Khởi tạo Preview ảnh thông minh ---
  const [posterPreview, setPosterPreview] = useState(() => {
    if (!initialData?.posterUrl) return "";
    // Nếu là link Cloudinary (bắt đầu bằng http) thì dùng luôn, ngược lại qua getImageUrl
    return initialData.posterUrl.startsWith('http') 
      ? initialData.posterUrl 
      : getImageUrl(initialData.posterUrl);
  });

  const basePath = pathname.includes('/super-admin') ? '/super-admin/movie' : '/admin/movies';

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await apiSuperAdminRequest('/api/v1/genres');
        if (res.ok) {
          const data = await res.json();
          setGenres(data.data || data);
        }
      } catch (err) { console.error("Lỗi tải thể loại"); }
    };
    fetchGenres();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Khi tạo mới thì bắt buộc có file, khi edit thì không bắt buộc (giữ ảnh cũ)
    if (type === 'create' && !selectedFile) return toast.error("Thiếu poster!");
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang lưu...");
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const movieData = {
      title: formData.get('title')?.toString().trim(),
      description: formData.get('description')?.toString().trim(),
      duration: Number(formData.get('duration')),
      director: formData.get('director')?.toString().trim(),
      cast: formData.get('cast')?.toString().trim(),
      country: formData.get('country')?.toString().trim(),
      status: formData.get('status'),
      trailerUrl: formData.get('trailerUrl')?.toString().trim(),
      releaseDate: formData.get('releaseDate'),
      genreId: Number(formData.get('genreId'))
    };

    const formDataPayload = new FormData();
    // Gửi kèm JSON data dưới dạng Blob (phù hợp với @RequestPart phía Spring Boot)
    formDataPayload.append('movie', new Blob([JSON.stringify(movieData)], { type: 'application/json' }));
    
    // --- FIX 2: Chỉ append file nếu người dùng có chọn file mới ---
    if (selectedFile) {
      formDataPayload.append('file', selectedFile);
    }

    try {
      const url = type === 'edit' ? `/api/v1/movies/${initialData?.id}` : `/api/v1/movies`;
      
      // Sử dụng PUT cho edit, POST cho create
      const response = await apiSuperAdminRequest(url, { 
        method: type === 'edit' ? 'PUT' : 'POST', 
        body: formDataPayload 
      });

      if (response.ok) {
        toast.success('Thành công!', { id: loadingToast });
        setTimeout(() => { 
          router.push(basePath); 
          router.refresh(); 
        }, 500);
      } else { 
        const errData = await response.json();
        toast.error(errData.message || "Lỗi cập nhật!", { id: loadingToast }); 
      }
    } catch (error) { 
      toast.error('Lỗi server!', { id: loadingToast }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-2 text-white animate-in fade-in duration-500">
      <Toaster position="top-right" />
      
      <button 
        type="button"
        onClick={() => router.push(basePath)} 
        className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 transition-all mb-4 font-black text-[9px] uppercase tracking-widest"
      >
        <ArrowLeft size={12} /> Quay lại
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
        {/* CỘT CHÍNH */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-[1.5rem] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-600/10"><Film size={18} /></div>
               <h1 className="text-xl font-[1000] italic uppercase tracking-tighter">
                {type === 'edit' ? 'Sửa' : 'Thêm'} <span className="text-zinc-600">Phim</span>
               </h1>
            </div>

            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Tiêu đề *</label>
                <input name="title" required defaultValue={initialData?.title} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 transition-all text-[13px] font-bold" placeholder="Tên phim..." />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Mô tả *</label>
                <textarea name="description" required rows={3} defaultValue={initialData?.description} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 text-[12px] leading-relaxed" placeholder="Nội dung tóm tắt..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Globe size={10}/> Quốc gia</label>
                  <input name="country" required defaultValue={initialData?.country} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Users size={10}/> Đạo diễn</label>
                  <input name="director" defaultValue={initialData?.director} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Diễn viên</label>
                <input name="cast" defaultValue={initialData?.cast} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" placeholder="Cách nhau bằng dấu phẩy..." />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Youtube size={11} className="text-red-600"/> Youtube Trailer</label>
                <input name="trailerUrl" type="url" defaultValue={initialData?.trailerUrl} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" placeholder="Link video..." />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHỤ */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-[1.5rem] space-y-4">
            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">Poster *</label>
               <div onClick={() => fileInputRef.current?.click()} className="relative aspect-[4/5] bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center cursor-pointer group overflow-hidden">
                 {posterPreview ? (
                    <img src={posterPreview} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Poster" />
                 ) : (
                   <div className="text-center opacity-20 group-hover:opacity-100 transition-opacity">
                      <Upload size={24} className="mx-auto mb-2" />
                      <p className="text-[8px] font-black uppercase">Tải ảnh</p>
                   </div>
                 )}
               </div>
               <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) { 
                    setSelectedFile(file); 
                    setPosterPreview(URL.createObjectURL(file)); 
                 }
               }} />
            </div>

            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center">
                <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-1"><Star size={10} className="text-yellow-600"/> Rating</label>
                <span className="text-[10px] font-black italic">{initialData?.rating || "0.0"}</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">Trạng thái</label>
                <select name="status" required defaultValue={initialData?.status || 'SHOWING'} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black text-zinc-400">
                  <option value="SHOWING">ĐANG CHIẾU</option>
                  <option value="COMING_SOON">SẮP CHIẾU</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">Thể loại *</label>
                <select name="genreId" required defaultValue={initialData?.genre?.id} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black text-zinc-400">
                  <option value="">-- CHỌN --</option>
                  {genres.map(g => <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Clock size={9}/> Thời lượng</label>
                    <input name="duration" type="number" required min="1" defaultValue={initialData?.duration} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Calendar size={9}/> Ngày khởi chiếu</label>
                    <input name="releaseDate" type="date" required defaultValue={initialData?.releaseDate?.split('T')[0]} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black uppercase" />
                 </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-white hover:text-black py-4 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {type === 'edit' ? 'Cập nhật' : 'Đăng phim'}
          </button>
        </div>
      </form>
    </div>
  );
}