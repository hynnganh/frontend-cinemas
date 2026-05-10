"use client";
import React, { useState, useEffect, use } from 'react';
import { 
  Play, Star, Heart, Share2, Award, 
  Calendar, Globe, Film, Ticket, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from "@/app/lib/api";
import toast, { Toaster } from 'react-hot-toast';
import ReviewModal from '../ReviewModal';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const response = await apiRequest(`/api/v1/movies/${movieId}`, { method: "GET" });
        if (response.ok) {
          const resData = await response.json();
          setMovie(resData.data || resData); 
        }
      } catch (error) { 
        toast.error("Không thể tải thông tin phim");
      } finally { setLoading(false); }
    };
    if (movieId) fetchMovieDetail();
  }, [movieId]);

  const handleWatchTrailer = () => {
    if (movie?.trailerUrl) window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
    else toast.error("Trailer chưa cập nhật!");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 uppercase font-black italic">
      <h2>Không tìm thấy phim</h2>
      <Link href="/" className="text-[10px] border-b border-zinc-800 text-zinc-500">Về trang chủ</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans">
      <Toaster position="top-center" />
      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        movieTitle={movie.title} 
        movieId={movieId}
      />
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[65vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={movie.posterUrl} className="w-full h-full object-cover opacity-20 blur-3xl scale-110" alt="bg" />          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center pt-20">
          <div className="max-w-6xl mx-auto px-6 w-full flex flex-col md:flex-row gap-10 items-center md:items-end pb-10">
            <div className="w-44 md:w-60 aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 shrink-0">
              <img src={movie.posterUrl} className="w-full h-full object-cover" alt="poster" />
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-red-600 text-white font-[1000] px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-widest italic">
                  {movie.status === "SHOWING" ? "ĐANG CHIẾU" : "SẮP CHIẾU"}
                </span>
                <span className="bg-white/5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-white/10 text-zinc-400">
                  {movie.duration} PHÚT
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-7xl font-[1000] italic tracking-tighter uppercase leading-[0.9] text-white drop-shadow-2xl">{movie.title}</h1>
                <div className="flex items-center justify-center md:justify-start gap-4">
                   <div className="flex items-center gap-2 text-yellow-500">
                      <Star size={18} fill="currentColor" />
                      <span className="text-2xl font-[1000] italic">{movie.rating?.toFixed(1) || "NEW"}</span>
                   </div>
                   <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                   <p className="text-[10px] font-black uppercase text-zinc-500 italic">{movie.genre?.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                {movie.status === "SHOWING" && (
                  <Link href={`${movieId}/booking/`} className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-[1.5rem] text-[11px] font-[1000] uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">
                    <Ticket size={16} /> ĐẶT VÉ NGAY
                  </Link>
                )}
                <button onClick={handleWatchTrailer} className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.5rem] text-[11px] font-[1000] uppercase text-white transition-all">
                  <Play size={16} fill="currentColor" /> XEM TRAILER
                </button>
                <button onClick={() => setIsLiked(!isLiked)} className={`p-4 rounded-[1.5rem] border transition-all ${isLiked ? 'bg-red-600 border-red-600' : 'bg-white/5 border-white/10'}`}>
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <h3 className="text-[12px] font-[1000] uppercase tracking-[0.4em] text-red-600 italic flex items-center gap-4"><span className="w-10 h-[3px] bg-red-600 rounded-full" /> NỘI DUNG PHIM</h3>
            <p className="text-zinc-400 text-lg md:text-xl leading-[1.8] font-medium italic bg-zinc-900/10 p-8 rounded-[3rem] border border-white/5">{movie.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-zinc-900/20 rounded-[3rem] border border-white/5">
            <InfoBox icon={<Film size={16}/>} label="ĐẠO DIỄN" value={movie.director} />
            <InfoBox icon={<Award size={16}/>} label="QUỐC GIA" value={movie.country} />
            <InfoBox icon={<Globe size={16}/>} label="NĂM" value={new Date(movie.releaseDate).getFullYear().toString()} />
            <InfoBox icon={<Calendar size={16}/>} label="PHÂN LOẠI" value={movie.genre?.name} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="p-8 bg-zinc-950 border border-white/5 rounded-[3.5rem] space-y-8 sticky top-10 shadow-2xl">
              <div className="space-y-4 text-center border-b border-white/5 pb-8">
                <p className="text-[9px] font-[1000] uppercase tracking-[0.5em] text-red-600">A&K CINEMA PRO</p>
                <p className="text-xs text-zinc-500 font-bold italic">Trải nghiệm âm thanh Dolby Atmos đỉnh cao.</p>
              </div>
              <button onClick={() => setIsReviewOpen(true)} className="w-full py-5 bg-white text-black rounded-[1.5rem] text-[10px] font-[1000] uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">
                GỬI ĐÁNH GIÁ CỦA BẠN
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-2">
      <div className="text-red-600">{icon}</div>
      <p className="text-[8px] font-black uppercase text-zinc-600 tracking-[0.2em]">{label}</p>
      <p className="text-sm font-black text-white uppercase truncate italic">{value || "N/A"}</p>
    </div>
  );
}