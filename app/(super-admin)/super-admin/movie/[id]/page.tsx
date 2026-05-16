"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Edit3, Trash2, Globe, Star, PlayCircle, 
  Clock, User, Tag, Loader2, Calendar, Hash
} from 'lucide-react';
import Link from 'next/link';
import { apiSuperAdminRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';

// Hàm helper để định dạng ngày Việt Nam
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export default function CompactAdminMovieDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Gọi API lấy chi tiết phim
        const res = await apiSuperAdminRequest(`/api/v1/movies/${id}`);
        const resData = await res.json();
        
        // Theo JSON của bà: Dữ liệu nằm trong resData.data
        if (res.ok && resData.status === 200) {
          setMovie(resData.data);
        } else {
          toast.error(resData.message || "Không thể tải thông tin phim");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Lỗi kết nối hệ thống!");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="h-[50vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-500" size={32} />
    </div>
  );

  if (!movie) return (
    <div className="text-zinc-500 text-center p-10 text-xs uppercase font-black tracking-widest">
      Không tìm thấy dữ liệu phim #{id}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Toaster position="top-right" />

      {/* Top Bar */}
      <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl transition-all group">
            <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-white leading-none">Quản lý phim</h1>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">UID: {movie.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/super-admin/movie/edit/${id}`} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-white/10 flex items-center gap-2 transition-all">
            <Edit3 size={14} /> Chỉnh sửa
          </Link>
          <button className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-red-500/20 transition-all">
            Xóa phim
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Cột trái - Poster */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl relative group">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-zinc-950">
                <Hash size={48} className="opacity-20" />
              </div>
            )}
          </div>
          
          <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
            <p className="text-[9px] font-black text-zinc-500 uppercase mb-3 tracking-tighter">Trạng thái phát hành</p>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${movie.status === 'ACTIVE' || movie.status === 'Đang chiếu' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {movie.status || 'N/A'}
              </span>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-black text-zinc-100 italic">{movie.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Thông tin chi tiết */}
        <div className="col-span-12 md:col-span-9 space-y-4">
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="mb-6">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{movie.genre?.name || 'Chưa phân loại'}</span>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mt-1 leading-tight">{movie.title}</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
              <SmallInfo icon={<Clock size={14}/>} label="Thời lượng" value={`${movie.duration} phút`} />
              <SmallInfo icon={<User size={14}/>} label="Đạo diễn" value={movie.director} />
              <SmallInfo icon={<Calendar size={14}/>} label="Ngày khởi chiếu" value={formatDate(movie.releaseDate)} />
              <SmallInfo icon={<Globe size={14}/>} label="Quốc gia" value={movie.country} />
              <SmallInfo icon={<Star size={14}/>} label="Điểm IMDb" value={`${movie.rating}/10`} />
              <SmallInfo icon={<Tag size={14}/>} label="Thể loại chính" value={movie.genre?.name} />
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-[9px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Dàn diễn viên</p>
              <p className="text-[12px] text-zinc-300 leading-relaxed font-medium bg-white/2 p-3 rounded-lg border border-white/5">{movie.cast || 'Đang cập nhật danh sách diễn viên...'}</p>
            </div>

            <div className="mt-6">
              <p className="text-[9px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Cốt truyện chi tiết</p>
              <div className="text-[12px] text-zinc-400 leading-relaxed italic bg-zinc-950/50 p-4 rounded-xl border border-white/5 shadow-inner">
                {movie.description || "Chưa có mô tả nội dung cho bộ phim này."}
              </div>
            </div>
            
            {movie.trailerUrl && (
              <div className="mt-8 flex items-center justify-between p-4 bg-red-600/5 rounded-xl border border-red-600/10 group hover:bg-red-600/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500 rounded-full text-white">
                    <PlayCircle size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-red-500 uppercase">Trailer chính thức</p>
                    <p className="text-[10px] text-zinc-500 truncate max-w-[250px] font-mono">{movie.trailerUrl}</p>
                  </div>
                </div>
                <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-white bg-red-600 px-4 py-2 rounded-lg uppercase hover:scale-105 transition-transform shadow-lg shadow-red-600/20">Xem ngay</a>
              </div>
            )}
          </div>
          
          {/* Audit Logs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/20 border border-white/5 p-4 rounded-xl flex justify-between items-center group">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Hệ thống tạo</span>
               <span className="text-[11px] text-zinc-400 font-mono">{formatDate(movie.createdAt)}</span>
            </div>
            <div className="bg-zinc-900/20 border border-white/5 p-4 rounded-xl flex justify-between items-center group">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Lần cuối sửa</span>
               <span className="text-[11px] text-zinc-400 font-mono">{formatDate(movie.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallInfo({ icon, label, value }: any) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2 text-zinc-500 group-hover:text-red-500 transition-colors">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
      </div>
      <p className="text-[12px] text-white font-bold uppercase truncate pl-6 border-l border-white/10">{value || 'N/A'}</p>
    </div>
  );
}