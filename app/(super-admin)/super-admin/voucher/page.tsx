"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Ticket, Calendar, Film, MapPin, Info, AlertCircle, Lock } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import VoucherModal from './VoucherModal';

export default function AdminVoucherManager() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/v1/vouchers');
      const json = await res.json();
      if (res.ok) setVouchers(json.data || []);
    } catch (e) {
      toast.error("Lỗi kết nối database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';
  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');

  const handleOpenModal = (voucher: any = null) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const method = selectedVoucher ? 'PUT' : 'POST';
      const url = selectedVoucher ? `/api/v1/vouchers/${selectedVoucher.id}` : '/api/v1/vouchers';
      const res = await apiRequest(url, { method, body: JSON.stringify(data) });
      
      if (res.ok) {
        toast.success(selectedVoucher ? "Đã cập nhật!" : "Đã tạo mã mới!");
        fetchVouchers();
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Thao tác thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVoucher) return;
    if (selectedVoucher.usedCount > 0) {
      toast.error("Voucher này đã có người lưu, không thể xóa!");
      setDeleteModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest(`/api/v1/vouchers/${selectedVoucher.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok) {
        toast.success("Đã xóa vĩnh viễn");
        fetchVouchers();
        setDeleteModalOpen(false);
      } else {
        toast.error(result.message || "Không thể xóa do ràng buộc dữ liệu");
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-400 font-sans p-4 md:p-8">
      {/* CSS fix ẩn thanh scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <Toaster position="top-right" reverseOrder={false} />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic flex items-center gap-4">
            <Ticket className="text-red-600" size={40} />
            Vouchers
          </h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2 ml-1">Trung tâm điều hành mã giảm giá</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text" placeholder="Tìm mã hoặc tên..." 
              className="bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs focus:border-red-600/50 outline-none w-72 backdrop-blur-md transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95 shadow-red-600/20"
          >
            <Plus size={18} /> Tạo mới
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="max-w-7xl mx-auto bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Đã thêm class no-scrollbar vào đây */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                <th className="px-8 py-6 border-b border-white/5">Thông tin Voucher</th>
                <th className="px-8 py-6 border-b border-white/5">Giảm giá</th>
                <th className="px-8 py-6 border-b border-white/5">Sử dụng</th>
                <th className="px-8 py-6 border-b border-white/5">Hiệu lực</th>
                <th className="px-8 py-6 border-b border-white/5 text-right">Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vouchers
                .filter(v => v.code.toLowerCase().includes(searchTerm.toLowerCase()) || v.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center group-hover:border-red-600/50 transition-colors">
                        <span className="text-[9px] font-black text-red-500 leading-none">CODE</span>
                        <span className="text-xs font-bold text-white mt-1 uppercase tracking-tighter">{v.code.substring(0, 4)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{v.code}</p>
                        <p className="text-[10px] text-zinc-600 font-medium mt-1 italic truncate max-w-[200px]">{v.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-white italic">
                    {v.discountValue < 100 ? `-${v.discountValue}%` : `-${formatCurrency(v.discountValue)}`}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center w-32">
                        <span className="text-[9px] font-black uppercase text-zinc-500">{v.usedCount}/{v.usageLimit}</span>
                        <span className="text-[8px] font-bold text-zinc-600">{Math.round((v.usedCount/v.usageLimit)*100)}%</span>
                      </div>
                      <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${v.usedCount >= v.usageLimit ? 'bg-zinc-600' : 'bg-red-600'}`} 
                          style={{ width: `${Math.min((v.usedCount/v.usageLimit)*100, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                      <Calendar size={12} className="text-zinc-700" />
                      {formatDate(v.endDate)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={() => handleOpenModal(v)} 
                        className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-black rounded-xl text-zinc-500 transition-all active:scale-90"
                      >
                        <Edit3 size={16} />
                      </button>

                      {v.usedCount > 0 ? (
                        <div className="relative group/lock">
                          <button 
                            className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 text-zinc-800 rounded-xl cursor-not-allowed"
                            disabled
                          >
                            <Lock size={16} className="opacity-20" />
                          </button>
                          <div className="absolute bottom-full right-0 mb-3 w-40 p-2 bg-red-600 text-white text-[8px] font-black uppercase rounded-lg opacity-0 group-hover/lock:opacity-100 transition-all pointer-events-none translate-y-2 group-hover/lock:translate-y-0 shadow-xl shadow-red-600/20 text-center">
                            Đã có {v.usedCount} khách lưu mã này
                            <div className="absolute top-full right-4 border-8 border-transparent border-t-red-600" />
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setSelectedVoucher(v); setDeleteModalOpen(true); }} 
                          className="w-10 h-10 flex items-center justify-center hover:bg-red-600/10 hover:text-red-500 rounded-xl text-zinc-500 transition-all active:scale-90"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 animate-pulse">Syncing Database...</span>
            </div>
          )}

          {!loading && vouchers.length === 0 && (
            <div className="py-32 text-center">
              <AlertCircle className="mx-auto text-zinc-800 mb-4" size={48} />
              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Không tìm thấy voucher nào</p>
            </div>
          )}
        </div>
      </div>

      <VoucherModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedVoucher}
        isSubmitting={isSubmitting}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative bg-[#0d0d0f] border border-white/5 p-8 rounded-[2.5rem] max-w-sm w-full animate-in zoom-in-95 shadow-2xl">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-black text-white text-center uppercase tracking-tighter">Xác nhận xóa?</h3>
            <p className="text-zinc-500 text-xs text-center mt-3 leading-relaxed">
              Dữ liệu của mã <span className="text-white font-bold">{selectedVoucher?.code}</span> sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteModalOpen(false)} 
                className="flex-1 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase transition-all flex items-center justify-center"
              >
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Đồng ý xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}