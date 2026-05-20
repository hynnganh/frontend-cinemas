"use client";
import React, { useState, useEffect, use, useRef } from 'react';
import { ChevronLeft, Loader2, Calendar, ChevronDown, Monitor, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from "../../../../lib/api"; 
import { getTokenByRole } from "@/app/lib/auth";

export default function MovieBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;
  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [showPicker, setShowPicker] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMovieDetail(); }, [movieId]);
  useEffect(() => { if (selectedDate) fetchShowtimes(); }, [selectedDate, movieId]);

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

  const handleBookingClick = (showtimeId: string) => {
    const userToken = getTokenByRole("USER");
    if (!userToken) { router.push('/auth'); return; }
    router.push(`/booking/${showtimeId}`);
  };

  const groupedShowtimes = showtimes.reduce((acc: any, st: any) => {
    const name = st.cinemaItem?.name || "Rạp A&K Cinema"; 
    if (!acc[name]) acc[name] = [];
    acc[name].push(st);
    return acc;
  }, {});

  const getWeeklyDays = () => {
    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({ full: d.toISOString().split('T')[0], date: d.getDate(), name: i === 0 ? "Nay" : weekdays[d.getDay()] });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pb-10 selection:bg-red-600">
      {/* Header tinh gọn */}
      <div className="sticky top-0 bg-[#030303]/90 backdrop-blur-md border-b border-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/movies/${movieId}`} className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <ChevronLeft size={16} className="text-zinc-400" />
              </div>
              <h1 className="text-[11px] font-black uppercase tracking-widest italic">{movie?.title || "Đang tải..."}</h1>
            </Link>

            <div className="relative">
              <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-red-500/50 transition-all">
                <Calendar size={12} className="text-red-500" />
                <span className="text-[9px] font-bold uppercase">{new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                <ChevronDown size={10} className="opacity-50" />
              </button>

              {showPicker && (
                <div className="absolute right-0 mt-2 z-20 bg-zinc-900 border border-zinc-800 rounded-xl p-2 w-40">
                  <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setShowPicker(false); }} className="w-full bg-transparent text-xs p-1" />
                </div>
              )}
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {getWeeklyDays().map((d) => (
              <button key={d.full} onClick={() => setSelectedDate(d.full)}
                className={`flex flex-col items-center justify-center min-w-[45px] h-12 rounded-lg border transition-all ${selectedDate === d.full ? 'bg-red-600 border-red-500' : 'bg-zinc-900/30 border-zinc-800'}`}>
                <span className="text-[8px] font-bold opacity-70">{d.name}</span>
                <span className="text-xs font-black">{d.date}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách suất chiếu */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>
        ) : Object.keys(groupedShowtimes).length > 0 ? (
          Object.entries(groupedShowtimes).map(([cinemaName, times]: any) => (
            <div key={cinemaName} className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                <MapPin size={12} className="text-red-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">{cinemaName}</h4>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {times.map((st: any) => (
                  <button key={st.id} onClick={() => handleBookingClick(st.id)}
                    className="py-2 bg-zinc-950 border border-zinc-800 hover:border-white rounded-md transition-all text-center group">
                    <span className="block text-[11px] font-bold">{st.startTime.split('T')[1].substring(0, 5)}</span>
                    <span className="block text-[7px] uppercase opacity-40 group-hover:text-red-500">{st.roomName || "2D"}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30"><Monitor size={24} className="mx-auto mb-2" /><p className="text-[10px] uppercase font-bold">Không có suất chiếu</p></div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
      `}</style>
    </div>
  );
}