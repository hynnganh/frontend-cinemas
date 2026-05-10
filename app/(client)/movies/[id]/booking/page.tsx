"use client";
import React, { useState, useEffect, use } from 'react';
import { ChevronLeft, Loader2, Calendar, ChevronDown } from 'lucide-react';
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
  // Khởi tạo ngày chọn là hôm nay
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [showPicker, setShowPicker] = useState(false);

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

  const groupedShowtimes = showtimes.reduce((acc: any, st: any) => {
    const name = st.cinemaItem?.name || "Rạp A&K Cinema"; 
    if (!acc[name]) acc[name] = [];
    acc[name].push(st);
    return acc;
  }, {});

  // --- LOGIC: HIỆN TUẦN THEO NGÀY ĐANG CHỌN ---
  const getWeeklyDays = () => {
    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    
    // Lấy mốc từ ngày đang được chọn
    const baseDate = new Date(selectedDate);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Kiểm tra xem có phải là "Hôm nay" thực tế không
      const isRealToday = dateStr === today.toISOString().split('T')[0];

      days.push({
        full: dateStr,
        date: d.getDate(),
        name: isRealToday ? "Nay" : weekdays[d.getDay()]
      });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-red-600">
      
      {/* HEADER SIÊU MẢNH */}
      <div className="sticky top-0 z-[100] bg-[#050505]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3">
          
          <div className="flex items-center justify-between mb-6">
            <Link href={`/movies/${movieId}`} className="flex items-center gap-2 group">
              <ChevronLeft size={16} className="text-zinc-500 group-hover:text-red-600 transition-colors" />
              <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 truncate max-w-[120px]">
                {movie?.title || "Đang tải..."}
              </h1>
            </Link>

            {/* CHỌN THÁNG/NĂM - DROP DOWN TẠI CHỖ */}
            <div className="relative">
              <button 
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 rounded-full border border-white/10 hover:border-red-600/50 transition-all"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-red-600 italic">
                  {new Date(selectedDate).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </span>
                <ChevronDown size={10} className={`text-zinc-600 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
              </button>

              {showPicker && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowPicker(false)} />
                  <div className="absolute right-0 mt-2 z-20 bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[8px] font-bold text-zinc-600 uppercase mb-2 ml-1">Chọn lịch vạn niên</p>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setShowPicker(false);
                      }}
                      className="bg-zinc-900 text-white text-[11px] font-black uppercase p-2 rounded-lg outline-none color-scheme-dark border border-white/5"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* WEEKLY STRIP - TỰ ĐỘNG CHẠY THEO NGÀY CHỌN */}
          <div className="flex justify-between items-center px-2">
            {getWeeklyDays().map((d) => {
              const isActive = selectedDate === d.full;
              return (
                <button 
                  key={d.full} 
                  onClick={() => setSelectedDate(d.full)}
                  className="flex flex-col items-center group relative py-2"
                >
                  <span className={`text-[7px] font-black uppercase tracking-tighter mb-1 transition-colors ${isActive ? 'text-red-600' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                    {d.name}
                  </span>
                  <span className={`text-[14px] font-[1000] italic transition-all ${isActive ? 'text-white scale-110 shadow-sm' : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                    {d.date}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DANH SÁCH SUẤT CHIẾU */}
      <div className="max-w-4xl mx-auto px-6 mt-10 space-y-10">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600/30" size={20} /></div>
        ) : Object.keys(groupedShowtimes).length > 0 ? (
          Object.entries(groupedShowtimes).map(([cinemaName, times]: any) => (
            <div key={cinemaName} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-[1px] w-6 bg-red-600" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 italic">{cinemaName}</h4>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {times.map((st: any) => (
                  <button 
                    key={st.id}
                    onClick={() => router.push(`/booking/${st.id}`)}
                    className="h-9 bg-zinc-900/40 border border-white/5 rounded-lg flex items-center justify-center transition-all hover:bg-white hover:text-black text-[11px] font-[1000] italic active:scale-95"
                  >
                    {st.startTime.split('T')[1].substring(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-800 italic leading-loose">
              Không có suất chiếu <br/> cho ngày này
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}