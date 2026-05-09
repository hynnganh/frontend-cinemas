"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Monitor, Armchair, Trash2, Building2, AlertTriangle, Settings2, ChevronRight, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { apiRequest } from '@/app/lib/api';
import FormPhongChieu from './RoomForm';

export default function QuanLyPhongCompact() {
  const router = useRouter();
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState<string>("");
  const [phongChieu, setPhongChieu] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [hienModal, setHienModal] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [duLieuForm, setDuLieuForm] = useState({ name: '', totalSeats: 0 });
  const [phongDangChonXoa, setPhongDangChonXoa] = useState<{id: number, name: string} | null>(null);

  // FIX: Hàm parse JSON an toàn
  const safeParse = async (res: Response) => {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  };

  const taiLaiDanhSach = async (targetId: number) => {
    try {
      const res = await apiRequest(`/api/v1/rooms/cinema-item/${targetId}`);
      if (res.ok) {
        const ketQua = await safeParse(res);
        setPhongChieu(ketQua.data || []);
      }
    } catch (err) {
      console.error("Lỗi cập nhật danh sách:", err);
    }
  };

  useEffect(() => {
    const khoiTao = async () => {
      try {
        setDangTai(true);
        const resUser = await apiRequest('/api/v1/users/me'); 
        if (!resUser.ok) throw new Error();
        
        const userRes = await safeParse(resUser);
        const idRap = userRes.data?.managedCinemaItemId;

        if (idRap) {
          setCinemaId(idRap);
          const resCinema = await apiRequest(`/api/v1/cinema-items/${idRap}`);
          const dataCinema = await safeParse(resCinema);
          setCinemaName(dataCinema.data?.name || `Cơ sở ${idRap}`);
          await taiLaiDanhSach(idRap);
        }
      } catch (err) {
        toast.error("Phiên đăng nhập hết hạn!");
        router.push('/login');
      } finally {
        setDangTai(false);
      }
    };
    khoiTao();
  }, [router]);

  const xuLyLuu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinemaId) return;

    const dangSua = !!dangSuaId;
    const url = dangSua ? `/api/v1/rooms/${dangSuaId}` : '/api/v1/rooms';
    const thongBao = toast.loading("Đang xử lý...");
    
    try {
      const res = await apiRequest(url, { 
        method: dangSua ? 'PUT' : 'POST', 
        body: JSON.stringify({ ...duLieuForm, cinemaItemId: cinemaId }) 
      });
      
      if (res.ok) {
        toast.success(dangSua ? "Cập nhật thành công!" : "Đã thêm phòng mới!", { id: thongBao });
        setHienModal(false);
        await taiLaiDanhSach(cinemaId); 
      } else {
        toast.error("Thao tác thất bại!", { id: thongBao });
      }
    } catch (err) {
      toast.error("Lỗi kết nối server!", { id: thongBao });
    }
  };

const xacNhanXoa = async () => {
  if (!phongDangChonXoa || !cinemaId) return;

  const thongBao = toast.loading("Đang xóa...");

  try {
    const res = await apiRequest(
      `/api/v1/rooms/${phongDangChonXoa.id}`,
      { method: "DELETE" }
    );

    let data: any = {};

    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (res.ok) {
      toast.success(
        data.message || "Đã xóa phòng thành công!",
        { id: thongBao }
      );

      setPhongDangChonXoa(null);
      await taiLaiDanhSach(cinemaId);

    } else {
      toast.error(
        data.message ||
        data.error ||
        "Phòng còn suất chiếu chưa diễn ra!",
        { id: thongBao }
      );
    }

  } catch (err) {
    toast.error("Không kết nối được server!", { id: thongBao });
  }
};

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Style Hầm Hố */}
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-zinc-900 rounded-3xl text-red-600 border border-white/5 shadow-2xl">
              <Building2 size={32}/>
            </div>
            <div>
              <h1 className="text-4xl font-[1000] italic text-white uppercase tracking-tighter leading-none">
                RẠP <span className="text-red-600">{cinemaName}</span>
              </h1>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] mt-3">Hệ thống quản lý phòng chiếu</p>
            </div>
          </div>
          
          {!dangTai && (
            <button 
              onClick={() => { setDangSuaId(null); setDuLieuForm({name:'', totalSeats:0}); setHienModal(true); }} 
              className="px-8 py-4 bg-white text-black rounded-2xl font-[1000] text-xs uppercase hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              + Thêm phòng
            </button>
          )}
        </header>

        {dangTai ? (
           <div className="flex flex-col items-center py-40 gap-4 opacity-40">
             <Loader2 className="animate-spin text-red-600" size={48} />
             <span className="text-[10px] font-black uppercase tracking-widest">Đang tải dữ liệu...</span>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {phongChieu.map((phong) => (
              <div 
                key={phong.id} 
                className="group relative bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 hover:border-red-600/30 transition-all duration-500 overflow-hidden shadow-2xl"
              >
                {/* Nút Xem chi tiết mờ ở nền */}
                <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="text-red-600" size={24} />
                </div>

                <div className="flex justify-between items-start mb-14">
                  <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-colors shadow-inner">
                    <Monitor size={28} className="text-white" />
                  </div>
                  <div className="flex gap-2 relative z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDangSuaId(phong.id); setDuLieuForm({name: phong.name, totalSeats: phong.totalSeats}); setHienModal(true); }} 
                      className="p-3 bg-white/5 hover:bg-white hover:text-black rounded-xl transition-all"
                    >
                      <Settings2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPhongDangChonXoa({ id: phong.id, name: phong.name }); }} 
                      className="p-3 bg-white/5 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-[1000] italic text-zinc-200 mb-6 group-hover:text-white uppercase tracking-tighter">
                  {phong.name}
                </h3>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Armchair size={16} className="text-zinc-700 group-hover:text-red-600" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{phong.totalSeats} Ghế</span>
                  </div>
                  
                  {/* Link Xem chi tiết */}
                  <button 
                    onClick={() => router.push(`/admin/rooms/${phong.id}`)}
                    className="text-[10px] font-black uppercase text-zinc-800 tracking-widest group-hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    Xem chi tiết <Eye size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Xóa */}
      {phongDangChonXoa && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setPhongDangChonXoa(null)}></div>
          <div className="relative bg-[#0d0d0f] border border-white/10 rounded-[3.5rem] p-12 w-full max-w-sm text-center">
            <AlertTriangle size={40} className="text-red-600 mx-auto mb-6" />
            <h2 className="text-2xl font-[1000] italic text-white mb-3 uppercase">Xác nhận xóa?</h2>
            <p className="text-zinc-500 text-[10px] font-bold mb-10 uppercase tracking-widest leading-relaxed">
              Dữ liệu của phòng <br/><span className="text-white">"{phongDangChonXoa.name}"</span> <br/> sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setPhongDangChonXoa(null)} className="flex-1 py-5 bg-zinc-900 text-zinc-600 rounded-2xl font-black uppercase text-[10px] hover:text-white transition-all">Hủy</button>
              <button onClick={xacNhanXoa} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      {hienModal && (
        <FormPhongChieu 
          dangSuaId={dangSuaId} 
          duLieuForm={duLieuForm} 
          setDuLieuForm={setDuLieuForm} 
          onSubmit={xuLyLuu} 
          onDong={() => setHienModal(false)}
        />
      )}
    </div>
  );
}