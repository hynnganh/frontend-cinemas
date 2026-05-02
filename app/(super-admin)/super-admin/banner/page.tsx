"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Zap, Search } from "lucide-react";
import { apiRequest, BASE_URL, getImageUrl } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import FormBanner from "./FormBanner";

export default function BannerManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [dangSua, setDangSua] = useState(false);
  const [idHienTai, setIdHienTai] = useState<number | null>(null);

  const emptyForm = {
    title: "",
    linkUrl: "",
    imageUrl: "",
    position: "HOME_TOP",
    status: "ACTIVE",
    sortOrder: 0,
  };

  const [duLieuForm, setDuLieuForm] = useState(emptyForm);

  // ================= FETCH =================
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/v1/banners");
      if (!res.ok) throw new Error();

      const json = await res.json();
      setBanners(json.data || []);
    } catch {
      toast.error("Lỗi tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ================= SAVE =================
  const handleLuu = async (formData: FormData) => {
    const method = dangSua ? "PUT" : "POST";
    const url = dangSua
      ? `/api/v1/banners/${idHienTai}`
      : "/api/v1/banners";

    const t = toast.loading("Đang xử lý...");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}${url}`, {
        method,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast.success("Thành công!", { id: t });

      setShowForm(false);
      setDangSua(false);
      setIdHienTai(null);
      setDuLieuForm(emptyForm);

      fetchBanners();
    } catch {
      toast.error("Lưu banner thất bại", { id: t });
    }
  };

  // ================= DELETE =================
  const deleteBanner = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa banner này?")) return;

    const t = toast.loading("Đang xóa...");

    try {
      const res = await apiRequest(`/api/v1/banners/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Đã xóa", { id: t });

      // Optimistic update
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Xóa thất bại", { id: t });
    }
  };

  // ================= EDIT =================
  const handleEdit = (b: any) => {
    setDangSua(true);
    setIdHienTai(b.id);

    // chỉ lấy field cần thiết
    setDuLieuForm({
      title: b.title || "",
      linkUrl: b.linkUrl || "",
      imageUrl: b.imageUrl || "",
      position: b.position || "HOME_TOP",
      status: b.status || "ACTIVE",
      sortOrder: b.sortOrder || 0,
    });

    setShowForm(true);
  };

  // ================= SEARCH =================
  const filteredBanners = banners.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 font-sans">
      <Toaster position="top-right" />

      {showForm && (
        <FormBanner
          dangSua={dangSua}
          idHienTai={idHienTai}
          duLieu={duLieuForm}
          setDuLieu={setDuLieuForm}
          onLuu={handleLuu}
          onDong={() => setShowForm(false)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 pb-10 border-b border-white/5">
          <h1 className="text-4xl font-black uppercase italic">
            Quản lý <span className="text-red-600">Banners</span>
          </h1>

          <button
            onClick={() => {
              setDangSua(false);
              setDuLieuForm(emptyForm);
              setShowForm(true);
            }}
            className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
          >
            <Plus size={14} className="inline mr-2" />
            Thêm mới
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-8 relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-3 text-zinc-500"
          />
          <input
            placeholder="Tìm banner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 pl-10 pr-4 py-3 rounded-xl outline-none text-sm"
          />
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Zap className="animate-spin text-red-600" size={40} />
            </div>
          ) : filteredBanners.length === 0 ? (
            <p className="col-span-full text-center text-zinc-500">
              Không có banner
            </p>
          ) : (
            filteredBanners.map((b) => (
              <div
                key={b.id}
                className="bg-zinc-950 border border-white/5 p-4 rounded-[2rem] hover:border-red-600/30 transition-all flex flex-col"
              >
                <img
                  src={getImageUrl(b.imageUrl)}
                  className="aspect-video rounded-xl object-cover mb-4 opacity-80"
                  alt={b.title}
                />

                <h3 className="font-black italic uppercase text-lg mb-2">
                  {b.title}
                </h3>

                <p className="text-[10px] text-zinc-500 mb-4 truncate">
                  {b.linkUrl}
                </p>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleEdit(b)}
                    className="flex-1 bg-zinc-900 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="bg-zinc-900 px-4 py-3 rounded-xl hover:bg-red-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}