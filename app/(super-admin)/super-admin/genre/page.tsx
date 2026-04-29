"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, Save, X, 
  Layers, Search, AlertCircle, CheckCircle2, 
  Zap
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/v1/genres');
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (e) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/v1/genres/${currentId}` : '/api/v1/genres';

    try {
      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEditing ? "Cập nhật thành công!" : "Thêm thể loại mới thành công!");
        resetForm();
        fetchCategories();
      } else {
        toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại.");
      }
    } catch (e) {
      toast.error("Thao tác thất bại.");
    }
  };

  // --- HÀM XÓA MỚI: Dùng Toast xác nhận thay cho Confirm mặc định ---
  const confirmDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-4 p-2">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-sm font-bold text-zinc-200">Xác nhận xóa thể loại này?</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(id);
            }}
            className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-[1000] uppercase rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            Đồng ý xóa
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      style: {
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '12px',
        borderRadius: '1.5rem',
      },
    });
  };

  const executeDelete = async (id: number) => {
    const loadingToast = toast.loading("Đang thực hiện xóa...");
    try {
      const res = await apiRequest(`/api/v1/genres/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa vĩnh viễn thể loại.", { id: loadingToast });
        fetchCategories();
      } else {
        toast.error("Không thể xóa mục này.", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Lỗi kết nối hệ thống.", { id: loadingToast });
    }
  };
  // ------------------------------------------------------------------

  const editCategory = (cat: any) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setFormData({ name: cat.name, description: cat.description });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: "", description: "" });
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10">
      {/* Toast container với style Dark Mode */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#121212',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '1rem',
            fontSize: '13px'
          },
        }} 
      />
      
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
          <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-600">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-[1000] uppercase italic tracking-tighter">
              Quản lý <span className="text-red-600">Thể loại</span>
            </h1>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1 italic">
              Database_Engine: Genres_Registry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORM (4 COL) */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 sticky top-8 shadow-2xl shadow-red-900/5">
              <h3 className="text-[11px] font-[1000] uppercase italic mb-8 flex items-center gap-3 text-zinc-400">
                {isEditing ? <Pencil size={16} className="text-amber-500" /> : <Plus size={16} className="text-red-600" />}
                {isEditing ? "Cập nhật bản ghi" : "Tạo bản ghi mới"}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase mb-2 block italic tracking-widest">Tên danh mục</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="..."
                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-800"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase mb-2 block italic tracking-widest">Mô tả hệ thống</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="..."
                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-red-600/50 transition-all resize-none placeholder:text-zinc-800"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-white text-black py-4 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Save size={14} /> {isEditing ? "Lưu thay đổi" : "Kích hoạt tạo"}
                  </button>
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-white transition-all active:scale-95 border border-white/5"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* TABLE (8 COL) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-all" size={18} />
              <input 
                type="text" 
                placeholder="TRUY VẤN DỮ LIỆU THỂ LOẠI..." 
                className="w-full bg-zinc-900/20 border border-white/5 rounded-[1.5rem] py-5 pl-16 text-[11px] font-black outline-none focus:border-red-600/50 uppercase tracking-widest transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="p-7 text-[9px] font-[1000] uppercase text-zinc-700 italic tracking-[0.2em]">Thông tin gốc</th>
                    <th className="p-7 text-[9px] font-[1000] uppercase text-zinc-700 italic tracking-[0.2em]">Dữ liệu mô tả</th>
                    <th className="p-7 text-[9px] font-[1000] uppercase text-zinc-700 italic text-right tracking-[0.2em]">Quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-24 text-center">
                        <Zap className="animate-spin text-red-600 mx-auto opacity-50" size={32} />
                        <p className="text-[10px] font-black uppercase text-zinc-700 mt-4 tracking-[0.5em] animate-pulse">Syncing...</p>
                      </td>
                    </tr>
                  ) : filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-red-600/[0.02] group transition-all">
                      <td className="p-7">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-zinc-800 group-hover:text-red-600 group-hover:border-red-600/20 transition-all italic font-black text-xs shadow-inner">
                            {cat.id}
                          </div>
                          <span className="text-base font-[1000] italic uppercase tracking-tighter group-hover:text-red-500 transition-colors">{cat.name}</span>
                        </div>
                      </td>
                      <td className="p-7">
                        <p className="text-xs text-zinc-600 italic max-w-[220px] truncate font-medium group-hover:text-zinc-400">{cat.description || "null_description"}</p>
                      </td>
                      <td className="p-7 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => editCategory(cat)}
                            className="p-3 bg-zinc-900/50 hover:bg-amber-500/20 hover:text-amber-500 rounded-xl transition-all border border-white/5 active:scale-90"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(cat.id)}
                            className="p-3 bg-zinc-900/50 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-white/5 active:scale-90"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}