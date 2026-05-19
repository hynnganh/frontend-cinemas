"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import { ChevronRight, Calendar } from "lucide-react";
import { apiRequest } from "../../../lib/api";

export default function MovieSection() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        // 🌟 FIX LOGIC: Chuyển sang status=COMING_SOON và sắp xếp theo ID mới nhất
        const response = await apiRequest("/api/v1/movies?status=COMING_SOON&page=0&size=6&sort=id,desc", { 
          method: "GET" 
        });
        
        if (response.ok) {
          const resData = await response.json();
          const targetData = resData.data;
          if (targetData) {
            setMovies(targetData.content || (Array.isArray(targetData) ? targetData : []));
          } else {
            setMovies(Array.isArray(resData) ? resData : (resData.content || []));
          }
        }
      } catch (error) {
        console.error("Lỗi tải phim sắp chiếu tại trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-6 md:px-12 py-12 bg-[#050505]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[2/3] max-w-[155px] mx-auto w-full bg-zinc-900/40 border border-zinc-800/20 animate-pulse rounded-[1rem]" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-14 bg-[#050505]">
      <div className="flex items-end justify-between mb-8 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          {/* Thanh chỉ dòng chuyển sang tone Hồng Pastel mang cảm giác mong đợi, đón chờ */}
          <div className="w-1.5 h-8 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]" /> 
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none italic">
                Phim Sắp Chiếu
              </h2>
              <Calendar size={14} className="text-pink-400 animate-pulse" />
            </div>
            <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-2">
              Những siêu phẩm bom tấn sắp sửa đổ bộ hệ thống rạp
            </span>
          </div>
        </div>
        
        <Link href="/movies/coming" className="block">
          <button className="group flex items-center gap-1.5 text-zinc-500 hover:text-white transition-all duration-300 font-bold text-[10px] uppercase tracking-widest">
            Xem tất cả 
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform text-pink-400" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 max-w-[1400px] mx-auto">
        {movies.map((movie: any) => (
          <div key={movie.id} className="transition-transform duration-300 hover:-translate-y-1">
            <MovieCard
              id={movie.id}
              title={movie.title}
              image={movie.posterUrl} 
              status={movie.status}
              rating={movie.rating} 
              genreName={movie.genreName} 
              ageRating={movie.ageRating} 
            />
          </div>
        ))}
      </div>
    </section>
  );
}