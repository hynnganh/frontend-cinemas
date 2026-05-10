"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Edit3, Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import ShowtimeModal from "./ShowtimeModal";
import { apiRequest } from "@/app/lib/api"; 
import toast, { Toaster } from "react-hot-toast";

export default function AdminShowtimePage() {
  const router = useRouter();
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Kiểm tra xem ngày đang chọn có phải là ngày trong quá khứ không
  const isPastDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(selectedDate);
    target.setHours(0, 0, 0, 0);
    return target < today;
  }, [selectedDate]);

  const weekTabs = useMemo(() => {
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(current);
    monday.setDate(current.getDate() - diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      return {
        full: iso,
        label: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: iso === new Date().toISOString().split('T')[0],
        // Đánh dấu ngày cũ để làm mờ trên thanh tab
        isOld: new Date(iso).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
      };
    });
  }, [selectedDate]);

  const changeWeek = (direction: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (direction * 7));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const resUser = await apiRequest('/api/v1/users/me');
      const userRes = await resUser.json();
      const idRap = userRes.data?.managedCinemaItemId;
      if (!idRap) return;
      
      setCinemaId(idRap);
      const [resCinema, resShow, resRoom, resMovie] = await Promise.all([
        apiRequest(`/api/v1/cinema-items/${idRap}`),
        apiRequest(`/api/v1/showtimes/cinema-item/${idRap}`),
        apiRequest(`/api/v1/rooms/cinema-item/${idRap}`),
        apiRequest("/api/v1/movies?status=SHOWING"),
      ]);

      const [c, s, r, m] = await Promise.all([resCinema.json(), resShow.json(), resRoom.json(), resMovie.json()]);
      setCinemaName(c.data?.name || `CƠ SỞ #${idRap}`);
      setShowtimes(s.data || []);
      setRooms(r.data || []);
      setMovies(m.data?.content || m.data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // HÀM CHẶN LƯU SUẤT CHIẾU QUÁ KHỨ
  const handleSave = async (data: any) => {
    const now = new Date();
    const showtimeDate = new Date(data.startTime);

    if (showtimeDate < now) {
      return toast.error("Không thể tạo hoặc sửa suất chiếu vào thời gian đã qua!");
    }

    const isUpdate = !!data.id;
    const tid = toast.loading(isUpdate ? "Đang cập nhật..." : "Đang tạo...");
    try {
      const res = await apiRequest(isUpdate ? `/api/v1/showtimes/${data.id}` : "/api/v1/showtimes", {
        method: isUpdate ? "PUT" : "POST",
        body: JSON.stringify({ ...data, cinemaItemId: cinemaId, price: 75000 }),
      });
      if (res.ok) {
        toast.success("Thành công!", { id: tid });
        setIsModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Lỗi trùng lịch!", { id: tid });
      }
    } catch (e) { toast.error("Lỗi kết nối!", { id: tid }); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-[1000] italic uppercase tracking-tighter">
            LỊCH CHIẾU <span className="text-red-600">{cinemaName}</span>
          </h1>
          {/* Ẩn nút tạo nếu đang ở ngày quá khứ */}
          {!isPastDate && (
            <button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} className="px-8 py-3 bg-white text-black rounded-2xl font-black text-[11px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">
              + Tạo suất chiếu
            </button>
          )}
        </div>

        <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-[2.5rem] mb-10 backdrop-blur-md flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 px-2">
             <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
             <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl border border-white/5">
               <CalendarIcon size={14} className="text-red-600" />
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer [color-scheme:dark]"
               />
             </div>
             <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"><ChevronRight size={20} /></button>
          </div>

          <div className="flex-1 flex justify-between w-full md:w-auto px-2 overflow-x-auto no-scrollbar gap-2">
            {weekTabs.map(tab => (
              <button 
                key={tab.full} 
                onClick={() => setSelectedDate(tab.full)}
                className={`flex flex-col items-center min-w-[55px] py-2 rounded-2xl transition-all ${
                  selectedDate === tab.full ? "bg-red-600" : "hover:bg-white/5"
                } ${tab.isOld ? "opacity-30" : ""}`} // Làm mờ ngày cũ
              >
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">{tab.label}</span>
                <span className="text-sm font-[1000]">{tab.dayNum}</span>
              </button>
            ))}
          </div>
        </div>

        {isPastDate && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
            <AlertCircle size={18} />
            <p className="text-[10px] font-black uppercase tracking-widest">Bạn đang xem lịch chiếu trong quá khứ. Không thể thêm hoặc chỉnh sửa.</p>
          </div>
        )}

        <div className="space-y-4">
          {rooms.map(room => (
            <div key={room.id} className={`bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 ${isPastDate ? "opacity-60" : ""}`}>
              <div className="w-32 shrink-0">
                <h3 className="text-lg font-[1000] uppercase italic tracking-tighter text-zinc-500">{room.name}</h3>
              </div>
              
              <div className="flex-1 flex flex-wrap gap-3">
                {showtimes
                  .filter(s => s.startTime?.startsWith(selectedDate) && s.room?.id === room.id)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(s => {
                    const isPassed = new Date(s.startTime) < new Date();
                    return (
                      <div 
                        key={s.id} 
                        className={`group flex items-center gap-3 bg-zinc-900 border border-white/5 pl-4 pr-2 py-2 rounded-2xl transition-all ${isPassed ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-red-600/50"}`}
                        onClick={() => !isPassed && router.push(`/admin/showtimes/${s.id}`)}
                      >
                        <span className="text-red-600 font-[1000] text-xs italic">{s.startTime.split('T')[1].substring(0, 5)}</span>
                        <p className="text-[9px] font-black uppercase truncate max-w-[120px] text-zinc-400">{s.movie?.title}</p>
                        {!isPassed && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedItem(s); setIsModalOpen(true); }} 
                            className="p-1.5 text-zinc-700 hover:text-red-600"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                
                {/* Ẩn nút thêm nếu là ngày cũ */}
                {!isPastDate && (
                  <button 
                    onClick={() => { setSelectedItem({ roomId: room.id, startTime: selectedDate }); setIsModalOpen(true); }} 
                    className="w-10 h-10 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-zinc-700 hover:text-red-600 hover:border-red-600 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ShowtimeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editData={selectedItem} 
        movies={movies} 
        rooms={rooms} 
      />
    </div>
  );
}