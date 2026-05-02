"use client";
import React, { useMemo } from 'react';
import Link from "next/link";
import { Ticket, Star, CalendarDays, Info } from "lucide-react";
import { getImageUrl } from "@/app/lib/api";

interface MovieCardProps {
  id: number;
  title: string;
  image: string;       // posterUrl từ API
  rating?: number | string | null;
  status?: string;     // "SHOWING" hoặc "COMING_SOON"
}

export default function MovieCard({ id, title, image, rating, status }: MovieCardProps) {
  const isShowing = status === "SHOWING";

  /**
   * FIX HIỂN THỊ ẢNH:
   * Kiểm tra nếu image là một URL tuyệt đối (Cloudinary) thì dùng luôn.
   * Nếu là tên file (Local) thì mới đi qua hàm getImageUrl.
   */
  const finalImageUrl = useMemo(() => {
    if (!image) return "https://png.pngtree.com/png-clipart/20190611/original/pngtree-surprised-face-expression-png-image_2888052.jpg";
    
    if (image.startsWith('http')) {
      return image;
    }
    
    return getImageUrl(image);
  }, [image]);

  // NGHIỆP VỤ RATING: 
  const hasRating = rating && Number(rating) > 0;
  const displayRating = hasRating ? Number(rating).toFixed(1) : "NEW";

  // NGHIỆP VỤ ẢNH LỖI:
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://png.pngtree.com/png-clipart/20190611/original/pngtree-surprised-face-expression-png-image_2888052.jpg";
  };

  return (
    <div className="group relative flex flex-col bg-[#0a0a0a] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-red-600/10 hover:-translate-y-4 border border-white/5">
      
      {/* 1. KHU VỰC POSTER (IMAGE CONTAINER) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <img
          src={finalImageUrl} 
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 
            ${!isShowing && 'grayscale-[0.3] group-hover:grayscale-0'}`} 
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Lớp phủ Gradient mượt mà */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90 transition-opacity duration-500" />

        {/* --- Badge Rating (Top Left) --- */}
        <div className={`absolute top-4 left-4 flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-xl border z-10 
          ${hasRating ? 'bg-black/40 border-yellow-500/30' : 'bg-red-600 border-red-500/50'}`}>
          {hasRating && <Star size={12} className="fill-yellow-500 text-yellow-500" />}
          <span className="text-white text-[11px] font-black tracking-tighter uppercase">
            {displayRating}
          </span>
        </div>

        {/* --- Badge Format (Top Right) --- */}
        {isShowing && (
          <div className="absolute top-4 right-4 bg-blue-600/50 backdrop-blur-md border border-blue-400/20 px-2 py-1 rounded-lg z-10">
            <span className="text-white text-[9px] font-black italic tracking-widest uppercase">IMAX</span>
          </div>
        )}

        {/* --- Nút Action khi Hover --- */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-6 group-hover:translate-y-0 z-30 px-6 gap-3">
          <Link href={`/movies/${id}`} className="w-full">
            <button className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all active:scale-95
              ${isShowing ? 'bg-red-600 text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
              {isShowing ? (
                <>
                  <Ticket size={18} fill="currentColor" />
                  Mua Vé Ngay
                </>
              ) : (
                <>
                  <CalendarDays size={18} />
                  Thông Tin Phim
                </>
              )}
            </button>
          </Link>
          
          <Link href={`/movies/${id}`} className="w-full">
            <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
              <Info size={16} /> Chi Tiết
            </button>
          </Link>
        </div>
      </div>

      {/* 2. KHU VỰC THÔNG TIN (INFO PANEL) */}
      <div className="p-6 relative flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-black text-white text-[18px] md:text-[20px] line-clamp-2 group-hover:text-red-500 transition-colors duration-300 uppercase tracking-tighter leading-tight mb-3 cursor-pointer">
            {title}
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              {!isShowing && <CalendarDays size={12} className="text-blue-500" />}
              {isShowing ? "Hành Động • Kinh Dị" : "Khởi chiếu: Sớm"}
            </span>
            
            <span className={`text-[10px] font-black border px-2 py-0.5 rounded italic 
              ${isShowing ? 'text-red-500 border-red-500/40' : 'text-blue-400 border-blue-400/40'}`}>
              {isShowing ? "T18" : "P"}
            </span>
          </div>
        </div>

        <div className={`h-[2px] w-0 transition-all duration-700 group-hover:w-full 
          ${isShowing ? 'bg-red-600' : 'bg-blue-600'}`} />
      </div>
    </div>
  );
}