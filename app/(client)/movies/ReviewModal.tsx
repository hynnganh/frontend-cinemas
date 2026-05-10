"use client";
import React, { useState } from 'react';
import { X, Star, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from "@/app/lib/api"; // Đảm bảo đường dẫn này đúng với project của ông giáo

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  movieId: string | number; // Thêm movieId để gửi API
}

export default function ReviewModal({ isOpen, onClose, movieTitle, movieId }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Validate trước khi gửi
    if (rating === 0) return toast.error("Vui lòng chọn số sao!");
    if (!comment.trim()) return toast.error("Vui lòng nhập cảm nhận!");

    setIsSubmitting(true);
    try {
      // Gọi API thực tế
      const response = await apiRequest("/api/v1/reviews", {
        method: "POST",
        body: JSON.stringify({
          movieId: Number(movieId), // Đảm bảo là kiểu số theo schema
          rating: rating,
          comment: comment.trim()
        }),
      });

      if (response.ok) {
        toast.success("Cảm ơn ông giáo đã đánh giá!");
        // Reset form và đóng modal
        setRating(0);
        setComment("");
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Gửi đánh giá thất bại!");
      }
    } catch (error) {
      console.error("Review Error:", error);
      toast.error("Lỗi kết nối máy chủ rồi má ơi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
      {/* Click ra ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24}/>
        </button>
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 italic">Review Film</h3>
            <h2 className="text-2xl font-[1000] italic uppercase tracking-tighter text-white leading-tight">
              {movieTitle}
            </h2>
          </div>

          {/* Rating Section */}
          <div className="flex flex-col items-center gap-2 py-6 bg-white/5 rounded-[2rem] border border-white/5">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={32} 
                  fill={(hover || rating) >= s ? "#dc2626" : "none"}
                  className={`cursor-pointer transition-all duration-200 ${(hover || rating) >= s ? "text-red-600 scale-110" : "text-zinc-800 hover:text-zinc-600"}`}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 h-4">
              {hover ? (
                hover === 5 ? "Cực phẩm!" : hover >= 4 ? "Rất hay" : hover >= 3 ? "Tạm ổn" : "Hơi tệ"
              ) : rating > 0 ? `Bạn đã chọn ${rating} sao` : "Chưa chọn mức độ hài lòng"}
            </p>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">
              Lời nhắn của ông giáo
            </label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bộ phim này có gì ấn tượng..."
              className="w-full h-32 bg-zinc-900 border border-white/5 rounded-[2rem] p-6 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all resize-none italic font-medium placeholder:text-zinc-700"
            />
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] text-[10px] font-[1000] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-red-600/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Send size={16}/> 
                <span>Gửi đánh giá ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}