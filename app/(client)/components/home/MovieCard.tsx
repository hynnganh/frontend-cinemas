"use client";

import React from "react";
import { Star, Play } from "lucide-react";
import { getImageUrl } from "../../../lib/api"; // Kiểm tra lại đường dẫn import api chuẩn của bặn
import Link from "next/link";

interface MovieCardProps {
  id: number;
  title: string;
  image: string;
  rating?: string | number;
  status?: string;
  ageRating?: string;
  genreName?: string;
}

export default function MovieCard({ 
  id, 
  title, 
  image, 
  rating, 
  status, 
  ageRating, 
  genreName 
}: MovieCardProps) {
  const isShowing = status === "SHOWING";
  const hasRating = rating && Number(rating) > 0;
  const displayRating = hasRating ? Number(rating).toFixed(1) : "MỚI";

  return (
    <Link 
      href={`/movies/${id}`} 
      /* Khống chế max-w-[155px] để card luôn nhỏ gọn ở mọi layout khác nhau */
      className="block group relative w-full max-w-[155px] mx-auto overflow-hidden rounded-[1rem] bg-[#111217] border border-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50 select-none"
    >
      {/* Khung ảnh đứng thẳng mini tỉ lệ dọc 2/3 */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#16171d]">
        <img
          src={getImageUrl(image)} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
          }}
        />
        
        {/* Lớp phủ gradient mượt mà */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/20 to-transparent opacity-90" />

        {/* Nút Play mini xuất hiện mượt mà khi hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-20">
          <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
            <Play size={12} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        {/* Nhãn điểm đánh giá nhỏ gọn ở góc trái */}
        <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/5 z-10">
          <Star size={8} className={`${hasRating ? 'fill-amber-400 text-amber-400' : 'text-sky-400 animate-pulse'}`} />
          <span className="text-white text-[8px] font-bold font-mono">{displayRating}</span>
        </div>

        {/* Nhãn độ tuổi nhỏ gọn ở góc phải */}
        {ageRating && (
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md border border-white/5 px-1 py-0.5 rounded-md z-10">
            <span className="text-pink-400 text-[7px] font-black font-mono">
              {ageRating}
            </span>
          </div>
        )}
      </div>

      {/* Thông tin chữ bên dưới ảnh hạ size mini siêu sạch sẽ */}
      <div className="p-2 space-y-0.5 bg-[#111217]">
        <h3 className="font-bold text-white text-[11px] md:text-[12px] line-clamp-1 tracking-tight group-hover:text-blue-400 transition-colors duration-200">
          {title}
        </h3>
        
        <div className="flex items-center justify-between gap-1 text-[9px]">
          <span className="line-clamp-1 text-zinc-500 max-w-[65%]">
            {genreName || "Chưa rõ"}
          </span>
          <span className={`text-[7px] font-bold px-1 rounded font-mono tracking-wide ${
            isShowing ? "text-orange-400 bg-orange-400/5" : "text-sky-400 bg-sky-400/5"
          }`}>
            {isShowing ? "LIVE" : "SẮP"}
          </span>
        </div>
      </div>
    </Link>
  );
}