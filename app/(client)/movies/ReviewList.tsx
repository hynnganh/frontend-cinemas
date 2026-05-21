"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Star, Calendar, Loader2, User, X, Maximize2 } from 'lucide-react';
import { apiRequest } from "@/app/lib/api";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ReviewList({ movieId }: { movieId: string | number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number>(0);
  
  // 🎯 State lưu ảnh đang được chọn để phóng to (Lightbox)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await apiRequest(`/api/v1/reviews/movie/${movieId}`);
        const result = await response.json();
        const data = result.data || result;
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi lấy danh sách review:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (movieId) fetchReviews();
  }, [movieId]);

  const filteredReviews = useMemo(() => {
    if (filterRating === 0) return reviews;
    return reviews.filter(r => Math.floor(r.rating) === filterRating);
  }, [reviews, filterRating]);

  const getFullName = (user: any) => {
    if (!user) return "Khán giả";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName !== "" ? fullName : (user.name || "Khán giả");
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h3 className="text-red-600 font-black uppercase tracking-[0.4em] italic text-[10px]">Audience Voices</h3>
          <h2 className="text-4xl font-[1000] italic text-white uppercase tracking-tighter">Đánh giá từ người xem</h2>
        </div>
        
        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {[0, 5, 4, 3, 2, 1].map((star) => (
            <button key={star} onClick={() => setFilterRating(star)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 shrink-0 ${
                filterRating === star ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              }`}>
              {star === 0 ? "Tất cả" : `${star} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* 🎯 Grid Danh sách (1 Cột dọc + Thanh trượt hiện đại) */}
      {/* Đã giảm khoảng cách các items (space-y-4) để list trông gọn hơn */}
      <div className="max-h-[600px] overflow-y-auto pr-3 modern-scrollbar space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            // Đã giảm padding p-6 xuống p-5, rounded-[2rem] xuống 1.5rem
            <div key={review.id} className="bg-[#0a0a0a] border border-white/5 p-5 md:p-6 rounded-[1.5rem] hover:border-red-600/30 transition-all group hover:bg-[#0d0d0d] shadow-xl flex flex-col">
              
              {/* Giảm khoảng cách mb-5 xuống mb-4 */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white border border-white/5 group-hover:border-red-600/50 transition-colors shrink-0 shadow-inner">
                    <User size={18} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-wider">{getFullName(review.user)}</p>
                    <p className="text-zinc-600 text-[9px] font-bold flex items-center gap-1 uppercase mt-0.5">
                      <Calendar size={10}/> {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </div>
                
                {/* Số sao đánh giá */}
                <div className="flex gap-0.5 bg-zinc-950 px-2.5 py-1 rounded-full border border-white/5 shadow-inner shrink-0">
                  {[...Array(5)].map((_, i) => {
                    const isFilled = i < Math.floor(review.rating);
                    return (
                      <Star key={i} size={11} fill={isFilled ? "#dc2626" : "none"} className={isFilled ? "text-red-600" : "text-zinc-800"} />
                    );
                  })}
                </div>
              </div>

              {/* Nội dung đánh giá */}
              <p className="text-zinc-400 text-[13px] italic leading-relaxed pl-3 border-l-2 border-red-600/20 group-hover:border-red-600/60 transition-colors">
                "{review.comment}"
              </p>

              {/* 🎯 Hình ảnh thu nhỏ (Đã thu nhỏ kích thước để gọn hơn) */}
              {review.imageUrl && (
                <div 
                  onClick={() => setSelectedImage(review.imageUrl)}
                  className="mt-4 w-20 h-20 sm:w-28 sm:h-28 rounded-[1rem] overflow-hidden border border-white/10 relative cursor-pointer group/img shadow-md hover:border-red-600/50 transition-all"
                >
                  <img 
                    src={review.imageUrl} 
                    alt="Review Thumbnail" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  />
                  {/* Lớp phủ khi Hover hiện nút Phóng to */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <Maximize2 size={18} className="text-white drop-shadow-md" />
                  </div>
                </div>
              )}

            </div>
          ))
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-zinc-950/20">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs italic">Chưa có đánh giá nào cho bộ phim này</p>
          </div>
        )}
      </div>

      {/* 🎯 MODAL LIGHTBOX (XEM ẢNH TO) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)} // Click ra ngoài để đóng
        >
          {/* Nút Đóng */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all z-50"
          >
            <X size={24} />
          </button>

          {/* Ảnh phóng to */}
          <div className="relative max-w-4xl max-h-[85vh] w-full rounded-xl flex justify-center">
            <img 
              src={selectedImage} 
              alt="Review Fullsize" 
              className="max-w-full max-h-[85vh] object-contain rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-400"
              onClick={(e) => e.stopPropagation()} // Chặn click vào ảnh bị đóng
            />
          </div>
        </div>
      )}

      {/* 🎯 GLOBAL CSS CHO THANH TRƯỢT HIỆN ĐẠI (CHỈ ÁP DỤNG TRONG KHUNG NÀY) */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Custom Scrollbar cho danh sách review */
        .modern-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .modern-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #dc2626; /* Đỏ khi Hover */
        }
      `}</style>
    </div>
  );
}