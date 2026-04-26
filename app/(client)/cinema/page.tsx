"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Clock, ChevronRight, Star } from 'lucide-react';
// 1. Import useRouter để điều hướng
import { useRouter } from 'next/navigation';
import { apiRequest, getImageUrl } from '@/app/lib/api';

const MovieShowtimeItem = ({ movie, onSelect }: any) => (
  <div className="group flex gap-4 p-4 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:border-red-600/30 hover:bg-zinc-900/60 transition-all duration-300">
    <div className="relative shrink-0">
      <div className="w-24 h-36 rounded-2xl overflow-hidden shadow-xl">
        <img 
          src={getImageUrl(movie.image)} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt={movie.title} 
        />
      </div>
    </div>

    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
      <div>
        <h4 className="text-base font-black uppercase italic tracking-tighter text-white truncate group-hover:text-red-500 transition-colors">
          {movie.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 opacity-50">
          <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {movie.duration}'</span>
          <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Star size={10} className="fill-red-600 text-red-600" /> {movie.genre}</span>
        </div>
      </div>

      <div className="space-y-3 mt-3">
        {movie.formats?.map((f: any, i: number) => (
          <div key={i} className="flex flex-col gap-2">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{f.type}</span>
            <div className="flex flex-wrap gap-2">
              {f.times.map((st: any) => (
                <button 
                  key={st.id} 
                  // 2. Gọi hàm onSelect khi nhấn vào giờ
                  onClick={() => onSelect(st.id)} 
                  className="px-4 py-2 rounded-xl bg-zinc-800 border border-white/5 text-[10px] font-black text-zinc-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-90"
                >
                  {st.time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Cinema() {
  // 3. Khởi tạo router
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingShowtimes, setFetchingShowtimes] = useState(false);

  useEffect(() => { 
    setIsMounted(true); 
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // 4. Hàm xử lý nhảy trang
  const handleBooking = (showtimeId: number) => {
    // Chuyển hướng sang trang booking kèm ID suất chiếu
    // Đường dẫn này tùy thuộc vào cấu trúc folder của bạn (ví dụ: app/booking/[id]/page.tsx)
    router.push(`/booking/${showtimeId}`);
  };

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await apiRequest('/api/v1/cinema-items');
        const result = await res.json();
        const list = result.data || [];
        setCinemas(list);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (!selectedId || !selectedDate) return;
    const fetchShowtimes = async () => {
      setFetchingShowtimes(true);
      try {
        const res = await apiRequest(`/api/v1/showtimes/cinema-item/${selectedId}`);
        const result = await res.json();
        if (result?.data) {
          const filtered = result.data.filter((item: any) => item.startTime.startsWith(selectedDate));
          const grouped = filtered.reduce((acc: any, curr: any) => {
            const m = curr.movie;
            if (!m) return acc;
            if (!acc[m.id]) {
              acc[m.id] = { 
                id: m.id, 
                title: m.title, 
                image: m.posterUrl, 
                duration: m.duration, 
                genre: m.genre?.name, 
                tag: m.rating >= 18 ? "T18" : "T13", 
                formats: {} 
              };
            }
            const type = curr.room?.name?.includes("IMAX") ? "IMAX 3D" : "2D DIGITAL";
            if (!acc[m.id].formats[type]) acc[m.id].formats[type] = [];
            acc[m.id].formats[type].push({ 
                id: curr.id, 
                time: new Date(curr.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }), 
                roomId: curr.room?.id 
            });
            return acc;
          }, {});
          setMovies(Object.values(grouped).map((m: any) => ({ ...m, formats: Object.entries(m.formats).map(([type, times]) => ({ type, times })) })));
        } else setMovies([]);
      } catch (e) { setMovies([]); } finally { setFetchingShowtimes(false); }
    };
    fetchShowtimes();
  }, [selectedId, selectedDate]);

  const dateTabs = useMemo(() => {
    const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      return { id: d.toISOString().split('T')[0], dayName: i === 0 ? "Hôm nay" : VI_DAYS[d.getDay()], dateNum: d.getDate() };
    });
  }, []);

  if (!isMounted || loading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;

  return (
    <div className="bg-[#050505] min-h-screen pt-20 pb-10 px-4 text-zinc-400">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Rạp */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600" size={14} />
            <input 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Tìm nhanh rạp..." 
              className="w-full bg-zinc-900/50 border border-white/5 py-3.5 pl-12 pr-4 rounded-2xl text-[11px] font-bold outline-none focus:border-red-600/50 transition-all" 
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
            {cinemas.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((c) => (
              <div 
                key={c.id} 
                onClick={() => setSelectedId(c.id)} 
                className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all flex items-center justify-between group ${
                  selectedId === c.id ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-zinc-900/20 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="min-w-0 text-left">
                  <h3 className="text-[11px] font-[1000] uppercase italic truncate">{c.name}</h3>
                  <p className={`text-[8px] font-bold mt-0.5 truncate opacity-50`}>{c.address}</p>
                </div>
                <ChevronRight size={14} className={selectedId === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {dateTabs.map(d => (
              <button 
                key={d.id} 
                onClick={() => setSelectedDate(d.id)} 
                className={`min-w-[65px] py-3 flex flex-col items-center rounded-2xl border transition-all ${
                  selectedDate === d.id ? 'bg-white text-black border-white' : 'bg-zinc-900/40 text-zinc-600 border-white/5'
                }`}
              >
                <span className="text-[7px] font-black uppercase mb-1">{d.dayName}</span>
                <span className="text-lg font-black italic">{d.dateNum}</span>
              </button>
            ))}
          </div>

          <div className="bg-zinc-900/10 rounded-[2.5rem] border border-white/5 p-2 min-h-[400px]">
            {fetchingShowtimes ? (
              <div className="h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>
            ) : movies.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {movies.map((m) => (
                  <MovieShowtimeItem 
                    key={m.id} 
                    movie={m} 
                    // 5. Truyền hàm xử lý nhảy trang vào item
                    onSelect={handleBooking} 
                  />
                ))}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center opacity-10 font-black uppercase text-[10px] italic tracking-widest">Không có suất chiếu</div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}