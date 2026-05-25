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
  
  // 🎯 THÊM STATE: Lưu trữ khu vực (Chi nhánh cha) đang được chọn
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<string>(
    formatLocalDate(today)
  );
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
    try {
      const res = await apiRequest(`/api/v1/showtimes/movie/${movieId}?date=${selectedDate}`);
      const data = await res.json();
      const fetchedShowtimes = res.ok ? data.data : [];
      setShowtimes(fetchedShowtimes);

      // 🎯 TỰ ĐỘNG CHỌN: Lấy danh sách các Chi nhánh cha có suất chiếu và chọn cái đầu tiên
      const parentCinemas = [...new Set(fetchedShowtimes.map((st: any) => st.cinemaItem?.cinema?.name || "Khu vực khác"))] as string[];
      if (parentCinemas.length > 0) {
        // Giữ nguyên khu vực đang chọn nếu nó vẫn có suất chiếu, nếu không thì chọn cái đầu tiên
        setSelectedParent(prev => prev && parentCinemas.includes(prev) ? prev : parentCinemas[0]);
      } else {
        setSelectedParent(null);
      }
    } catch (error) {
      console.error("Lỗi lấy suất chiếu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (showtimeId: string) => {
    const userToken = getTokenByRole("USER");
    if (!userToken) { router.push('/auth'); return; }
    router.push(`/booking/${showtimeId}`);
  };

  // 🎯 LOGIC GOM NHÓM: Gom theo Chi nhánh Cha (Tỉnh/TP) -> Chi nhánh Con (Tên Rạp)
  const groupedShowtimes = showtimes.reduce((acc: any, st: any) => {
    // Lấy tên Chi nhánh cha (Ví dụ: Hồ Chí Minh, Hà Nội). Thay đổi đường dẫn này nếu JSON Backend khác
    const parentName = st.cinemaItem?.cinema?.name || "Khu vực khác"; 
    // Lấy tên Chi nhánh con (Ví dụ: A&K Hùng Vương)
    const branchName = st.cinemaItem?.name || "Rạp A&K Cinema"; 

    if (!acc[parentName]) acc[parentName] = {};
    if (!acc[parentName][branchName]) acc[parentName][branchName] = [];
    
    acc[parentName][branchName].push(st);
    return acc;
  }, {});

  // Lấy danh sách các Chi nhánh cha từ cục data đã gom nhóm
  const parentList = Object.keys(groupedShowtimes);

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
      <div className="sticky top-0 bg-[#030303]/95 backdrop-blur-md border-b border-zinc-900/50 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/movies/${movieId}`} className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <ChevronLeft size={16} className="text-zinc-400" />
              </div>
              <h1 className="text-[11px] font-black uppercase tracking-widest italic line-clamp-1 max-w-[200px]">
                {movie?.title || "Đang tải..."}
              </h1>
            </Link>

            <div className="relative">
              <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-red-500/50 transition-all">
                <Calendar size={12} className="text-red-500" />
                <span className="text-[9px] font-bold uppercase">{new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                <ChevronDown size={10} className="opacity-50" />
              </button>

              {showPicker && (
                <div className="absolute right-0 mt-2 z-20 bg-zinc-900 border border-zinc-800 rounded-xl p-2 w-40 shadow-2xl">
                  <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setShowPicker(false); }} className="w-full bg-transparent text-xs p-1 outline-none text-white color-scheme-dark" />
                </div>
              )}
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {getWeeklyDays().map((d) => (
              <button key={d.full} onClick={() => setSelectedDate(d.full)}
                className={`flex flex-col items-center justify-center min-w-[45px] h-12 rounded-lg border transition-all ${selectedDate === d.full ? 'bg-red-600 border-red-500' : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/50'}`}>
                <span className="text-[8px] font-bold opacity-70">{d.name}</span>
                <span className="text-xs font-black">{d.date}</span>
              </button>
            ))}
          </div>

          {/* 🎯 MENU CHI NHÁNH CHA (Tỉnh/Thành phố) */}
          {!loading && parentList.length > 0 && (
            <div className="mt-4 border-t border-zinc-800/50 pt-3 flex gap-6 overflow-x-auto scrollbar-hide">
              {parentList.map(parent => (
                <button
                  key={parent}
                  onClick={() => setSelectedParent(parent)}
                  className={`whitespace-nowrap text-[12px] font-black uppercase transition-all duration-300 pb-2 border-b-2 ${
                    selectedParent === parent
                      ? 'text-white border-red-600'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  {parent}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách suất chiếu theo Chi nhánh con */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>
        ) : selectedParent && groupedShowtimes[selectedParent] ? (
          
          // Lặp qua các Chi nhánh con (Rạp) thuộc Chi nhánh cha đang được chọn
          Object.entries(groupedShowtimes[selectedParent]).map(([branchName, times]: any) => (
            <div key={branchName} className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                <MapPin size={12} className="text-red-500" />
                <h4 className="text-[12px] font-black tracking-wide text-zinc-100">{branchName}</h4>
              </div>
              
              {/* Lưới suất chiếu */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {times.map((st: any) => {
                  // Tách logic kiểm tra định dạng rạp (nếu có, ví dụ 2D, 3D)
                  const format = st.format || "2D Phụ Đề"; 
                  return (
                    <button key={st.id} onClick={() => handleBookingClick(st.id)}
                      className="py-2 bg-zinc-950 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 rounded-md transition-all text-center group">
                      <span className="block text-[13px] font-bold text-white group-hover:text-red-400">
                        {st.startTime.split('T')[1].substring(0, 5)}
                      </span>
                      <span className="block text-[8px] font-semibold text-zinc-500 uppercase mt-0.5 group-hover:text-red-500/70">
                        {format}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30 flex flex-col items-center">
            <Monitor size={32} className="mb-3 opacity-50" />
            <p className="text-[12px] uppercase font-bold tracking-widest">Không có suất chiếu</p>
            <p className="text-[10px] mt-1 font-medium">Vui lòng chọn ngày khác hoặc khu vực khác</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        input[type="date"]::-webkit-calendar-picker-indicator { 
          filter: invert(1); 
          cursor: pointer; 
        }
        .color-scheme-dark {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
}