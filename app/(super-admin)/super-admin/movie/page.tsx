"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Film, Loader2, Search, Clapperboard, Clock, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiRequest, getImageUrl } from '@/app/lib/api';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = async (search = "", pageNum = 0) => {
    setLoading(true);
    try {
      // Đúng path API phân trang của bặn
      const url = `/api/v1/movies?search=${encodeURIComponent(search)}&page=${pageNum}&size=10`;
      const response = await apiRequest(url);
      const result = await response.json();
      
      if (response.ok) {
        // Map đúng theo cấu trúc: result.data.content
        setMovies(result.data?.content || []);
        setTotalPages(result.data?.totalPages || 0);
      }
    } catch (error) { 
      toast.error("Lỗi kết nối server!"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => { 
      setPage(0); 
      fetchMovies(searchTerm, 0); 
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Fetch khi chuyển trang
  useEffect(() => {
    fetchMovies(searchTerm, page);
  }, [page]);

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="text-white p-1">
        <p className="text-[10px] font-black uppercase mb-3 tracking-[0.2em]">Xác nhận hủy phim này?</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            toast.dismiss(t.id);
            const res = await apiRequest(`/api/v1/movies/${id}`, { method: 'DELETE' });
            if (res.ok) { 
              toast.success("Đã xóa phim!"); 
              fetchMovies(searchTerm, page); 
            } else {
              toast.error("Không thể xóa phim này!");
            }
          }} className="bg-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-700 transition-all">Xóa</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-white/20">Hủy</button>
        </div>
      </div>
    ), { style: { background: '#0c0c0c', border: '1px solid #222', borderRadius: '16px' } });
  };

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <Toaster position="top-right" />

      {/* Header tinh chỉnh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
        <div>
          <h1 className="text-4xl font-[1000] uppercase italic tracking-tighter text-white">
            KHO <span className="text-red-600">PHIM</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Hệ thống quản lý nội dung</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={14} />
            <input 
              type="text" value={searchTerm}
              placeholder="Tìm kiếm phim..."
              className="bg-black/40 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-[11px] text-white focus:outline-none focus:border-red-600/50 w-full transition-all focus:bg-black"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/super-admin/movie/create" className="bg-red-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-red-600/10">
            <Plus size={14} /> Thêm Phim
          </Link>
        </div>
      </div>

      {/* Danh sách phim */}
      <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.03] text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] border-b border-white/5">
              <th className="px-8 py-5">Phim</th>
              <th className="px-8 py-5">Thông tin</th>
              <th className="px-8 py-5">Trạng thái</th>
              <th className="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {loading ? (
              <tr><td colSpan={4} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-red-600" size={32} /></td></tr>
            ) : movies.length === 0 ? (
              <tr><td colSpan={4} className="py-32 text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Không có dữ liệu phim</td></tr>
            ) : (
              movies.map((movie: any) => (
                <tr key={movie.id} className="group hover:bg-white/[0.01] transition-all">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-5">
                      <div className="relative w-12 h-16 shrink-0 shadow-2xl">
                        <img 
                          src={movie.posterUrl && movie.posterUrl.startsWith('http') 
                                ? movie.posterUrl 
                                : getImageUrl(movie.posterUrl)}
                          className="w-full h-full object-cover rounded-xl border border-white/10 group-hover:border-red-600/50 transition-all" 
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/100x150?text=No+Poster")}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-black uppercase italic tracking-tighter text-base truncate group-hover:text-red-500 transition-colors">
                          {movie.title}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-black mt-1 uppercase tracking-widest flex items-center gap-1">
                          <Hash size={10} /> ID: {movie.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white bg-zinc-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {movie.genreName || 'GENERAL'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                        <Clock size={10} className="text-red-600" /> {movie.duration} PHÚT
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className={`text-[9px] font-black uppercase flex items-center gap-2 ${movie.status === 'SHOWING' ? 'text-emerald-500' : 'text-orange-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${movie.status === 'SHOWING' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-orange-500'}`} />
                      {movie.status === 'SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <Link href={`/super-admin/movie/edit/${movie.id}`} className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-red-600 transition-all shadow-xl">
                        <Edit3 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(movie.id)} className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all shadow-xl">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Modern */}
        <div className="px-10 py-6 flex items-center justify-between bg-white/[0.02] border-t border-white/5">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
            Hiển thị trang <span className="text-white">{page + 1}</span> / <span className="text-white">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 disabled:opacity-20 hover:text-white transition-all border border-white/5 flex items-center gap-2 text-[10px] font-black uppercase"
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <button 
              disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 disabled:opacity-20 hover:text-white transition-all border border-white/5 flex items-center gap-2 text-[10px] font-black uppercase"
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}