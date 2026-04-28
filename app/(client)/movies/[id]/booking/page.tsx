"use client";
import React, { useState, useEffect, use, useRef } from 'react';
import { Calendar, MapPin, ChevronLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, getImageUrl } from "../../../../lib/api"; 

export default function MovieBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;
  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Quản lý Tháng và Ngày được chọn
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);

  useEffect(() => {
    fetchMovieDetail();
  }, [movieId]);

  useEffect(() => {
    if (selectedDate) fetchShowtimes();
  }, [selectedDate, movieId]);

  const fetchMovieDetail = async () => {
    const res = await apiRequest(`/api/v1/movies/${movieId}`);
    const data = await res.json();
    if (res.ok) setMovie(data.data);
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    const res = await apiRequest(`/api/v1/showtimes/movie/${movieId}?date=${selectedDate}`);
    const data = await res.json();
    setShowtimes(res.ok ? data.data : []);
    setLoading(false);
  };

  // Tạo danh sách 3 tháng tới để chọn
  const getMonths = () => {
    const months = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        label: `Tháng ${d.getMonth() + 1}`,
        month: d.getMonth(),
        year: d.getFullYear()
      });
    }
    return months;
  };

  // Tạo danh sách ngày dựa trên tháng được chọn
  const getDaysInMonth = () => {
    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const numDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    for (let i = 1; i <= numDays; i++) {
      const d = new Date(selectedYear, selectedMonth, i);
      // Chỉ hiện những ngày từ hôm nay trở đi nếu là tháng hiện tại
      if (selectedMonth === today.getMonth() && i < today.getDate()) continue;

      days.push({
        full: d.toISOString().split('T')[0],
        date: i,
        name: i === today.getDate() && selectedMonth === today.getMonth() ? "Nay" : weekdays[d.getDay()]
      });
    }
    return days;
  };

  const groupedShowtimes = showtimes.reduce((acc: any, st: any) => {
    const name = st.cinemaItem?.name || "Rạp A&K Cinema"; 
    if (!acc[name]) acc[name] = [];
    acc[name].push(st);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans pb-20">
      
      {/* STICKY HEADER & BỘ CHỌN */}
      <div className="sticky top-0 z-[100] bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-4 space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/movies/${movieId}`} className="p-2 hover:bg-white/5 rounded-full transition-all">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-xl font-[1000] italic uppercase tracking-tighter text-white truncate max-w-xs md:max-w-none">
              {movie?.title}
            </h1>
          </div>

          {/* 1. CHỌN THÁNG (Style CGV Minimalist) */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide border-b border-white/5 pb-2">
            {getMonths().map((m) => (
              <button
                key={`${m.month}-${m.year}`}
                onClick={() => {
                  setSelectedMonth(m.month);
                  setSelectedYear(m.year);
                  // Tự động chọn ngày đầu tiên khả dụng của tháng đó
                  const firstDay = m.month === today.getMonth() ? today.getDate() : 1;
                  const newDate = new Date(m.year, m.month, firstDay).toISOString().split('T')[0];
                  setSelectedDate(newDate);
                }}
                className={`shrink-0 text-[11px] font-[1000] uppercase tracking-[0.2em] px-4 py-2 rounded-full transition-all ${
                  selectedMonth === m.month 
                  ? 'bg-red-600 text-white' 
                  : 'text-zinc-600 hover:text-zinc-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* 2. CHỌN NGÀY (Ẩn thanh cuộn) */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x pt-2">
            {getDaysInMonth().map((d) => (
              <button 
                key={d.full} 
                onClick={() => setSelectedDate(d.full)}
                className={`snap-start min-w-[55px] h-[75px] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                  selectedDate === d.full 
                    ? 'bg-white border-white text-black scale-105 shadow-xl shadow-white/5' 
                    : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                }`}
              >
                <span className={`text-[8px] font-black uppercase mb-1 ${selectedDate === d.full ? 'text-zinc-400' : 'text-zinc-600'}`}>{d.name}</span>
                <span className="text-xl font-[1000] leading-none">{d.date}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-10">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" size={30} /></div>
        ) : Object.keys(groupedShowtimes).length > 0 ? (
          Object.entries(groupedShowtimes).map(([cinemaName, times]: any) => (
            <div key={cinemaName} className="group animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-8 bg-red-600 rounded-full" />
                <div>
                  <h4 className="text-lg font-black italic uppercase tracking-tight text-white">{cinemaName}</h4>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Tiêu chuẩn quốc tế</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {times.map((st: any) => (
                  <button 
                    key={st.id}
                    onClick={() => router.push(`/booking/${st.id}`)}
                    className="relative h-14 bg-zinc-900/40 border border-white/5 rounded-xl flex items-center justify-center transition-all hover:bg-white hover:text-black hover:border-white active:scale-95 group/time"
                  >
                    <span className="text-sm font-[1000] italic uppercase">{st.startTime.split('T')[1].substring(0, 5)}</span>
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
              <div className="h-[1px] w-full bg-white/5 mt-10" />
            </div>
          ))
        ) : (
          <div className="py-32 text-center border border-dashed border-white/5 rounded-[3rem]">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 italic">Không có suất chiếu cho ngày đã chọn</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}