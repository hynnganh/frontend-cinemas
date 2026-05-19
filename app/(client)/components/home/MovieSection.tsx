"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import { ChevronRight } from "lucide-react";
import { apiRequest } from "../../../lib/api";

export default function MovieSection() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        {/* 🌟 FIX LOGIC: Đổi từ sort theo ID (mới nhất) sang sort theo RATING (Điểm cao nhất) */}
        const response = await apiRequest("/api/v1/movies?status=SHOWING&page=0&size=6&sort=rating,desc", { 
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
        console.error("Lỗi tải phim đánh giá cao trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedMovies();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-6 md:px-12 py-12 bg-[#0f0f0f]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[2/3] max-w-[155px] mx-auto w-full bg-zinc-800/30 animate-pulse rounded-[1rem]" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-12 bg-[#0f0f0f]">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-3">
          {/* Đổi màu shadow hiệu ứng từ đỏ sang cam rực rỡ đại diện cho điểm số/ngôi sao */}
          <div className="w-1 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" /> 
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none">
              Phim Được Yêu Thích
            </h2>
            <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-1 opacity-80">
              Top siêu phẩm có điểm đánh giá cao nhất
            </span>
          </div>
        </div>
        
        <Link href="/movies/top-rated" className="block">
          <button className="group flex items-center gap-1.5 text-zinc-500 hover:text-white transition-all duration-300 font-bold text-[10px] uppercase tracking-widest">
            Xem tất cả 
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform text-orange-500" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
        {movies.map((movie: any) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            image={movie.posterUrl} 
            status={movie.status}
            rating={movie.rating} 
            genreName={movie.genreName} 
            ageRating={movie.ageRating} 
          />
        ))}
      </div>
    </section>
  );
}