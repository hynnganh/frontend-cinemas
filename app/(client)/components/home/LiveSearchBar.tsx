"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';
import { apiRequest, getImageUrl } from '@/app/lib/api'; 

export default function LiveSearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logic Debounce (Chống lag) & Gọi API
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest(`/api/v1/movies?search=${encodeURIComponent(searchTerm)}&size=5&status=SHOWING`, {}, 'USER');
        const data = await res.json();
        
        if (data.status === 200 && data.data?.content) {
          setResults(data.data.content);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm phim:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchMovies();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectMovie = (movieId: number) => {
    setIsOpen(false);
    setSearchTerm("");
    // 🎯 ĐÃ FIX ĐƯỜNG DẪN: Chuyển từ /movie/ sang /movies/ cho khớp với thẻ MovieCard
    router.push(`/movies/${movieId}`); 
  };

  return (
    <div className="relative w-full z-[120]" ref={dropdownRef}>
      {/* 🚀 TĂNG ĐỘ DÀI & ANIMATION CO GIÃN */}
      <div className="relative group/search w-[240px] focus-within:w-[340px] xl:w-[280px] xl:focus-within:w-[380px] transition-all duration-500 ease-out">
        <div className="relative flex items-center w-full h-10 rounded-full bg-gradient-to-b from-zinc-900 to-black border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),_0_2px_10px_rgba(0,0,0,0.4)] focus-within:border-red-600/50 focus-within:shadow-[0_0_20px_rgba(220,38,38,0.2),_inset_0_2px_10px_rgba(0,0,0,0.8)] transition-all duration-500 px-4">
          
          <Search size={16} className="text-zinc-500 group-focus-within/search:text-red-500 transition-colors duration-300" />
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder="Tìm phim..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-600 border-none outline-none focus:outline-none focus:ring-0 ml-2 tracking-wide font-medium"
          />
          
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-red-500 shrink-0" />
          ) : searchTerm ? (
            <button onClick={() => setSearchTerm("")} className="text-zinc-500 hover:text-white shrink-0 transition-colors">
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {/* 🎬 KHUNG DROPDOWN KẾT QUẢ CỰC MƯỢT */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-[340px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-4 duration-300">
          {results.map((movie) => {
            const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "2026";
            
            const displayGenres = movie.genreNames?.length > 0 
              ? movie.genreNames.join(", ") 
              : "Đang cập nhật";

            return (
              <div 
                key={movie.id} 
                onClick={() => handleSelectMovie(movie.id)}
                className="flex gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors items-center group/item"
              >
                {/* Ảnh Phim */}
                <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-800 border border-white/5 group-hover/item:border-red-500/50 transition-colors">
                  <img 
                    src={getImageUrl(movie.posterUrl)} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
                    }}
                  />
                </div>

                {/* Thông tin Phim */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate leading-tight mb-1 group-hover/item:text-red-500 transition-colors">
                    {movie.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 truncate mb-1">
                    {movie.director || "The Movie"}
                  </p>
                  
                  {/* Cụm thông số (Năm, Độ tuổi, Thể loại) */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium mt-1.5">
                    <span>{releaseYear}</span>
                    <span className="px-1.5 py-0.5 bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/20 rounded text-[8px] font-black uppercase">
                      {movie.ageRating || "P"}
                    </span>
                    <span className="truncate max-w-[150px] text-zinc-400">{displayGenres}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Khi không tìm thấy */}
      {isOpen && results.length === 0 && searchTerm && !isLoading && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-[340px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-6 text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-xs text-zinc-500 font-medium">Không tìm thấy "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}