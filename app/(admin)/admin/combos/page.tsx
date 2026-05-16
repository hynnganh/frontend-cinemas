"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Loader2, Search, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

interface ComboAdmin {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  available: boolean; 
}

export default function AdminComboPage() {
  const [combos, setCombos] = useState<ComboAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm helper lấy token admin cô lập một cách an toàn
  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_admin") || "";
    }
    return "";
  };

  const loadCombos = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = getAdminToken();

      // Đính kèm trực tiếp token_admin vào headers để tránh phụ thuộc hàm apiRequest cũ
      const res = await apiRequest("/api/v1/admin/cinema-combos", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const result = await res.json();
      
      if (res.ok) {
        const data = Array.isArray(result) ? result : (result.data || []);
        setCombos(data);
      } else {
        toast.error(result.message || "Không thể tải danh mục combo");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  const handleToggle = async (comboId: number) => {
    if (togglingId) return;
    setTogglingId(comboId);

    try {
      const token = getAdminToken();

      // Đính kèm token_admin cho hành động cập nhật trạng thái bật/tắt combo
      const res = await apiRequest(`/api/v1/admin/cinema-combos/${comboId}/toggle`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        setCombos((prev) =>
          prev.map((c) =>
            c.id === comboId ? { ...c, available: !c.available } : c
          )
        );
        toast.success("Đã cập nhật trạng thái combo thành công");
      } else {
        toast.error("Không thể cập nhật trạng thái");
      }
    } catch (e) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredCombos = combos.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#eee] p-6 font-sans antialiased">      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">Thực đơn chi nhánh</h1>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
              Chi nhánh đang quản lý: <span className="text-orange-500">Hệ thống A&K Cinema</span>
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text"
              placeholder="Tìm tên combo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-orange-500 outline-none transition-all placeholder:text-zinc-600 text-white"
            />
          </div>
        </div>

        {/* Combo Grid */}
        {loading ? (
          <div className="py-40 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-orange-600" size={48} />
            <span className="text-xs font-bold text-zinc-600 tracking-widest uppercase">Đang đồng bộ thực đơn...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCombos.map((combo) => (
              <div 
                key={combo.id} 
                className={`group bg-zinc-900/30 border transition-all duration-500 rounded-[2.5rem] overflow-hidden flex flex-col ${
                  combo.available 
                    ? "border-white/5 hover:border-orange-500/30" 
                    : "border-red-900/10 bg-red-900/5 grayscale-[0.8]"
                }`}
              >
                {/* Image Section */}
                <div className="aspect-square w-full bg-zinc-800 relative overflow-hidden">
                  <img 
                    src={combo.imageUrl || "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?q=80&w=400"} 
                    alt={combo.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!combo.available && 'opacity-40'}`}
                  />
                  <div className="absolute top-4 right-4">
                    {combo.available ? (
                      <div className="bg-orange-600 text-white p-1.5 rounded-full shadow-lg">
                        <CheckCircle2 size={16} />
                      </div>
                    ) : (
                      <div className="bg-zinc-900 text-zinc-500 p-1.5 rounded-full border border-white/5">
                        <XCircle size={16} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className={`text-sm font-black uppercase tracking-tight line-clamp-1 ${combo.available ? 'text-white' : 'text-zinc-500'}`}>
                      {combo.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed min-h-[30px]">
                      {combo.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${combo.available ? 'text-orange-500' : 'text-zinc-600'}`}>
                      {Number(combo.price).toLocaleString()}đ
                    </span>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(combo.id)}
                      disabled={togglingId === combo.id}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                        combo.available ? "bg-orange-600" : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-transform duration-300 ease-in-out ${
                          combo.available ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                      {togglingId === combo.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 size={12} className="animate-spin text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCombos.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-zinc-900/10">
            <ShoppingBag className="mx-auto text-zinc-800 mb-4" size={48} />
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Không có combo nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}