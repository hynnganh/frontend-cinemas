"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Layers, Zap, AlertCircle, ExternalLink } from 'lucide-react';
import { apiRequest, BASE_URL } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import FormBanner from './FormBanner';

export default function BannerManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [dangSua, setDangSua] = useState(false);
  const [idHienTai, setIdHienTai] = useState<number | null>(null);
  const [duLieuForm, setDuLieuForm] = useState({
    title: "", linkUrl: "", imageUrl: "", position: "HOME_TOP", status: "ACTIVE", sortOrder: 0
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/v1/banners');
      if (res.ok) {
        const json = await res.json();
        setBanners(json.data || []);
      }
    } catch (e) {
      toast.error("Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleLuu = async (formData: FormData) => {
    const method = dangSua ? 'PUT' : 'POST';
    const url = dangSua ? `/api/v1/banners/${idHienTai}` : '/api/v1/banners';
    const t = toast.loading("Đang xử lý...");

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}${url}`, {
        method,
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: formData
      });

      if (res.ok) {
        toast.success("Thành công!", { id: t });
        setShowForm(false);
        fetchBanners();
      } else {
        const err = await res.json();
        toast.error(err.message || "Thất bại", { id: t });
      }
    } catch (e) {
      toast.error("Lỗi kết nối", { id: t });
    }
  };

  const deleteBanner = async (id: number) => {
    const l = toast.loading("Đang xóa...");
    const res = await apiRequest(`/api/v1/banners/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success("Đã xóa", { id: l });
      fetchBanners();
    } else {
      toast.error("Xóa thất bại", { id: l });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 font-sans">
      <Toaster position="top-right" />
      {showForm && <FormBanner dangSua={dangSua} idHienTai={idHienTai} duLieu={duLieuForm} setDuLieu={setDuLieuForm} onLuu={handleLuu} onDong={() => setShowForm(false)} />}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 pb-10 border-b border-white/5">
          <h1 className="text-4xl font-black uppercase italic">Quản lý <span className="text-red-600">Banners</span></h1>
          <button onClick={() => { setDangSua(false); setDuLieuForm({ title: "", linkUrl: "", imageUrl: "", position: "HOME_TOP", status: "ACTIVE", sortOrder: 0 }); setShowForm(true); }} className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
            + Thêm mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? <Zap className="animate-spin text-red-600 mx-auto col-span-full" /> : 
            banners.map(b => (
              <div key={b.id} className="bg-zinc-950 border border-white/5 p-4 rounded-[2rem] hover:border-red-600/30 transition-all flex flex-col">
                <img src={`${BASE_URL}${b.imageUrl}`} className="aspect-video rounded-xl object-cover mb-4 opacity-70" alt={b.title} />
                <h3 className="font-black italic uppercase text-lg mb-2">{b.title}</h3>
                <p className="text-[10px] text-zinc-500 mb-4 truncate">{b.linkUrl}</p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => { setDangSua(true); setIdHienTai(b.id); setDuLieuForm(b); setShowForm(true); }} className="flex-1 bg-zinc-900 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-black">Sửa</button>
                  <button onClick={() => deleteBanner(b.id)} className="bg-zinc-900 px-4 py-3 rounded-xl hover:bg-red-600 text-white transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}