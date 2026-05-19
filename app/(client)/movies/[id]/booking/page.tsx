"use client";
import React, { useState, useEffect, use, useRef } from 'react';
import { ChevronLeft, Loader2, Calendar, ChevronDown, Monitor, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from "../../../../lib/api"; 

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

  // Gom nhóm suất chiếu theo cụm rạp
  const groupedShowtimes = showtimes.reduce((acc: any, st: any) => {
    const name = st.cinemaItem?.name || "Rạp A&K Cinema"; 
    if (!acc[name]) acc[name] = [];
    acc[name].push(st);
    return acc;
  }, {});

  // --- LOGIC MỚI: TẠO 14 NGÀY ĐỂ CUỘN NGANG TỪ HÔM NAY ---
  const getWeeklyDays = () => {
    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isRealToday = i === 0;

      days.push({
        full: dateStr,
        date: d.getDate(),
        name: isRealToday ? "Nay" : weekdays[d.getDay()]
      });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pb-24 selection:bg-red-600">
      
      {/* HEADER ĐIỆN ẢNH TỐI GIẢN */}
      <div className="sticky top-0 z-[100] bg-[#030303]/85 backdrop-blur-md border-b border-zinc-900/60">
        <div className="max-w-5xl mx-auto px-4 py-4">
          
          <div className="flex items-center justify-between mb-5">
            <Link href={`/movies/${movieId}`} className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center group-hover:border-red-600/30 transition-all">
                <ChevronLeft size={14} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
              </div>
              <div>
                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Đang chọn suất chiếu</p>
                <h1 className="text-xs font-black uppercase tracking-wider text-white truncate max-w-[200px] sm:max-w-[320px] italic">
                  {movie?.title || "Đang tải phim..."}
                </h1>
              </div>
            </Link>

            {/* BỘ CHỌN LỊCH VẠN NIÊN CAO CẤP */}
            <div className="relative">
              <button 
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 rounded-xl border border-zinc-800 hover:border-red-600/40 transition-all shadow-inner"
              >
                <Calendar size={12} className="text-red-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                  {new Date(selectedDate).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </span>
                <ChevronDown size={12} className={`text-zinc-600 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
              </button>

              {showPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
                  <div className="absolute right-0 mt-2 z-20 bg-[#0a0a0c] border border-zinc-800 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 w-56">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider mb-2.5 ml-1">Chọn ngày cụ thể</p>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setShowPicker(false);
                      }}
                      className="w-full bg-zinc-900 text-white text-xs font-bold uppercase p-2.5 rounded-xl outline-none border border-zinc-800 color-scheme-dark focus:border-red-600 transition-colors"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* THANH CUỘN NGANG CHỌN NGÀY SIÊU MƯỢT (SCROLLABLE STRIP) */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 mask-linear-edge"
          >
            {getWeeklyDays().map((d) => {
              const isActive = selectedDate === d.full;
              return (
                <button 
                  key={d.full} 
                  onClick={() => setSelectedDate(d.full)}
                  className={`flex flex-col items-center justify-center min-w-[55px] h-16 rounded-xl transition-all relative border flex-shrink-0 ${
                    isActive 
                      ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/10 scale-[1.02]' 
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 group'
                  }`}
                >
                  <span className={`text-[8px] font-black uppercase tracking-wider mb-1 ${isActive ? 'text-white/80' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                    {d.name}
                  </span>
                  <span className={`text-base font-black italic tracking-tighter ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                    {d.date}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DANH SÁCH SUẤT CHIẾU THEO CỤM RẠP */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-red-600" size={24} />
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Đang quét rạp chiếu...</p>
          </div>
        ) : Object.keys(groupedShowtimes).length > 0 ? (
          Object.entries(groupedShowtimes).map(([cinemaName, times]: any) => (
            <div key={cinemaName} className="bg-[#09090b]/40 border border-zinc-900/80 rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-3 duration-500 hover:border-zinc-800/60 transition-colors">
              
              {/* Tên Rạp Phim */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-3.5 bg-red-600 rounded-sm shadow-[0_0_8px_#dc2626]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-200 italic">{cinemaName}</h4>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-bold">
                  <MapPin size={12} className="text-zinc-700" />
                  <span>Cơ sở đối tác hệ thống A&K</span>
                </div>
              </div>

              {/* Grid Suất Chiếu */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {times.map((st: any) => (
                  <button 
                    key={st.id}
                    onClick={() => router.push(`/booking/${st.id}`)}
                    className="group bg-zinc-950/80 border border-zinc-900 hover:border-white rounded-xl p-2.5 flex flex-col items-center justify-center transition-all hover:bg-white active:scale-95 text-center relative overflow-hidden h-[54px]"
                  >
                    {/* Giờ Chiếu */}
                    <span className="text-sm font-black italic text-white group-hover:text-black transition-colors tracking-tight">
                      {st.startTime.split('T')[1].substring(0, 5)}
                    </span>
                    
                    {/* Nhãn loại phòng giả định (Tạo độ chuyên nghiệp cho UI rạp) */}
                    <span className="text-[7px] font-black uppercase tracking-widest text-red-500/80 group-hover:text-zinc-500 transition-colors mt-0.5">
                      {st.roomName || "PHÒNG 2D"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          /* TRẠNG THÁI TRỐNG LỊCH CHIẾU */
          <div className="py-28 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
            <Monitor size={32} className="mx-auto text-zinc-800 mb-4 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">
              Không tìm thấy lịch chiếu
            </p>
            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-wider mt-1.5">
              Vui lòng chọn một ngày khác trong danh sách lịch tuần
            </p>
          </div>
        )}
      </div>

      {/* CSS CUSTOM CHO MẶT NẠ ĐẦU/CUỐI THANH CUỘN & ẨN SCROLLBAR */}
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .mask-linear-edge {
          position: relative;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}