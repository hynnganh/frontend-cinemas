"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Clock, Monitor, MapPin, 
  Film, Star, Info, Loader2, Edit3, Trash2, Calendar
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiAdminRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import ShowtimeModal from '../ShowtimeModal'; 

export default function ChiTietSuatChieu() {
  const router = useRouter();
  const { id } = useParams();
  
  const [data, setData] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [cinemaId, setCinemaId] = useState<number | null>(null); // State lưu ID rạp thật
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Lấy thông tin user để biết đang quản lý rạp nào (Dùng Cookie qua /me)
      const resUser = await apiAdminRequest('/api/v1/users/me');
      if (!resUser.ok) throw new Error("Unauthorized");
      
      const userRes = await resUser.json();
      const idRapThat = userRes.data?.managedCinemaItemId;

      if (!idRapThat) {
        toast.error("Bạn không có quyền quản lý rạp nào!");
        router.push('/admin/showtimes');
        return;
      }
      setCinemaId(idRapThat);

      // 2. Gọi các API dữ liệu dựa trên id rạp thật
      const [resShow, resRoom, resMovie] = await Promise.all([
        apiAdminRequest(`/api/v1/showtimes/${id}`),
        apiAdminRequest(`/api/v1/rooms/cinema-item/${idRapThat}`),
        apiAdminRequest("/api/v1/movies?status=SHOWING"),
      ]);

      if (resShow.ok) {
        const result = await resShow.json();
        setData(result.data);
      } else {
        toast.error("Không tìm thấy suất chiếu!");
        router.push('/admin/showtimes');
      }

      if (resRoom.ok && resMovie.ok) {
        const r = await resRoom.json();
        const m = await resMovie.json();
        setRooms(Array.isArray(r.data) ? r.data : []);
        const movieList = m.data?.content || m.data || [];
        setMovies(Array.isArray(movieList) ? movieList : []);
      }
    } catch (err) {
      toast.error("Phiên đăng nhập hết hạn hoặc lỗi kết nối!");
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm xử lý Lưu sau khi Sửa - Đã fix dùng cinemaId thật
  const handleSaveEdit = async (formData: any) => {
    if (!cinemaId) return;
    const toastId = toast.loading("Đang cập nhật hệ thống...");
    try {
      const res = await apiAdminRequest(`/api/v1/showtimes/${formData.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...formData, cinemaItemId: cinemaId, price: 75000 }),
      });

      if (res.ok) {
        toast.success("Cập nhật thành công!", { id: toastId });
        setIsEditModalOpen(false);
        fetchData(); 
      } else {
        const result = await res.json();
        toast.error(result.message || "Trùng lịch chiếu!", { id: toastId });
      }
    } catch (e) {
      toast.error("Lỗi hệ thống!", { id: toastId });
    }
  };

  // Hàm xử lý Xóa
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này không?")) return;
    const toastId = toast.loading("Đang gỡ bỏ suất chiếu...");
    try {
      const res = await apiAdminRequest(`/api/v1/showtimes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa suất chiếu thành công!", { id: toastId });
        router.push('/admin/showtimes');
      } else {
        toast.error("Không thể xóa suất chiếu này!", { id: toastId });
      }
    } catch (e) { toast.error("Lỗi kết nối máy chủ!", { id: toastId }); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Đang đồng bộ dữ liệu</span>
    </div>
  );

  if (!data) return null;

  // Logic tính toán giờ kết thúc
  const startTime = new Date(data.startTime);
  const movieDuration = data.movie.duration || 0;
  const endTime = new Date(startTime.getTime() + movieDuration * 60000);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 p-6 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto"> 
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Trở về quản lý lịch chiếu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: POSTER & ACTIONS */}
          <div className="md:col-span-4 space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/5 shadow-2xl group ring-1 ring-white/10">
              <img 
                src={data.movie.posterUrl} 
                alt={data.movie.title}
                className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-[1000] uppercase italic rounded-lg mb-2 inline-block shadow-lg">
                  {data.movie.genre?.name || "Premium Movie"}
                </span>
                <h1 className="text-2xl font-[1000] uppercase italic text-white tracking-tighter leading-tight drop-shadow-2xl">
                  {data.movie.title}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
               <button 
                 onClick={() => setIsEditModalOpen(true)}
                 className="flex items-center justify-center gap-3 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-xl"
               >
                 <Edit3 size={18} /> Chỉnh sửa lịch
               </button>
               <button 
                 onClick={handleDelete}
                 className="flex items-center justify-center gap-3 py-4 bg-zinc-900 text-zinc-500 rounded-2xl font-black text-[11px] uppercase border border-white/5 hover:bg-red-600 hover:text-white transition-all active:scale-95"
               >
                 <Trash2 size={18} /> Gỡ bỏ suất
               </button>
            </div>
          </div>

          {/* CỘT PHẢI: INFO CHI TIẾT */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Box Thời gian */}
            <div className="flex gap-4 p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] backdrop-blur-xl ring-1 ring-white/5">
                <div className="flex-1 border-r border-white/10">
                  <div className="flex items-center gap-2 mb-2 opacity-60 uppercase font-black text-[9px] text-zinc-400 tracking-widest">
                    <Clock size={12} className="text-red-600"/> Giờ khởi chiếu
                  </div>
                  <p className="text-4xl font-[1000] italic uppercase text-white tracking-tighter">
                    {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[11px] font-black text-zinc-500 mt-2 uppercase flex items-center gap-2">
                    <Calendar size={12} className="text-zinc-700"/> {startTime.toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                <div className="flex-1 pl-6">
                  <div className="flex items-center gap-2 mb-2 opacity-60 uppercase font-black text-[9px] text-zinc-400 tracking-widest">
                    <Clock size={12} /> Hạ màn dự kiến
                  </div>
                  <p className="text-4xl font-[1000] italic uppercase text-zinc-500 tracking-tighter">
                    {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[11px] font-black text-red-600/60 mt-2 uppercase tracking-[0.2em]">
                    {movieDuration} PHÚT TRÌNH CHIẾU
                  </p>
                </div>
            </div>

            {/* Box Vị trí Phòng/Rạp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] hover:border-red-600/20 transition-all group">
                <Monitor size={18} className="text-zinc-800 group-hover:text-red-600 mb-3 transition-colors"/>
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Hall Room</p>
                <h3 className="text-xl font-[1000] uppercase italic text-zinc-300 group-hover:text-white transition-colors">{data.room.name}</h3>
                <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-tight">{data.room.totalSeats} Ghế thiết lập</p>
              </div>
              <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] hover:border-red-600/20 transition-all group">
                <MapPin size={18} className="text-zinc-800 group-hover:text-red-600 mb-3 transition-colors"/>
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Cơ sở vận hành</p>
                <h3 className="text-xl font-[1000] uppercase italic text-zinc-300 group-hover:text-white truncate">
                  {data.cinemaItem.address || data.cinemaItem.name}
                </h3>
                <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-tight">{data.cinemaItem.city}</p>
              </div>
            </div>

            {/* Box Thông tin phim tóm tắt */}
            <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-inner">
               <div className="grid grid-cols-3 gap-6 border-b border-white/5 pb-6 mb-6">
                 <div>
                   <p className="text-[9px] text-zinc-700 font-black uppercase mb-1 tracking-widest">Đạo diễn</p>
                   <p className="text-[12px] text-zinc-300 font-bold italic truncate">{data.movie.director}</p>
                 </div>
                 <div>
                   <p className="text-[9px] text-zinc-700 font-black uppercase mb-1 tracking-widest">Quốc gia</p>
                   <p className="text-[12px] text-zinc-300 font-bold italic">{data.movie.country}</p>
                 </div>
                 <div>
                   <p className="text-[9px] text-zinc-700 font-black uppercase mb-1 tracking-widest">Đánh giá</p>
                   <div className="flex items-center gap-1.5 text-yellow-500 mt-0.5">
                     <Star size={12} fill="currentColor" />
                     <span className="text-[12px] font-[1000]">{data.movie.rating}/5</span>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Nội dung tóm tắt</span>
               </div>
               <p className="text-xs leading-relaxed text-zinc-500 italic font-medium">
                 "{data.movie.description}"
               </p>
            </div>

          </div>
        </div>
      </div>

      <ShowtimeModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveEdit} 
        editData={data} 
        movies={movies} 
        rooms={rooms} 
      />
    </div>
  );
}