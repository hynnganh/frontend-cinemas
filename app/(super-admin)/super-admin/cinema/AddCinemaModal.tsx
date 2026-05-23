"use client";

import React, {
  useState,
  useEffect,
} from "react";

import {
  X,
  Zap,
  ChevronRight,
  Loader2,
  Building2,
  MapPin,
  Info,
  Save,
  ShieldCheck,
  AlertTriangle,
  Clock3,
} from "lucide-react";

import toast from "react-hot-toast";

import { apiSuperAdminRequest }
from "@/app/lib/api";

// ================= TYPES =================
interface AddCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

interface ErrorState {
  name?: string;
  city?: string;
  address?: string;
  hoursPerRoom?: string;
}

// ================= COMPONENT =================
export default function AddCinemaModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddCinemaModalProps) {

  // ================= STATES =================
  const [cinemaName, setCinemaName] =
    useState("");

  const [city, setCity] =
    useState("TP. Hồ Chí Minh");

  const [address, setAddress] =
    useState("");

  const [hoursPerRoom, setHoursPerRoom] =
    useState(12);

  const [errors, setErrors] =
    useState<ErrorState>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {

    if (initialData && isOpen) {

      setCinemaName(
        initialData.name || ""
      );

      setCity(
        initialData.city || "TP. Hồ Chí Minh"
      );

      setAddress(
        initialData.address || ""
      );

      setHoursPerRoom(
        initialData.hoursPerRoom || 12
      );

    } else if (isOpen) {

      setCinemaName("");
      setCity("TP. Hồ Chí Minh");
      setAddress("");
      setHoursPerRoom(12);
    }

    setErrors({});

  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // ================= VALIDATE =================
  const validateForm = () => {

    const newErrors: ErrorState = {};

    // NAME
    if (!cinemaName.trim()) {

      newErrors.name =
        "Tên chi nhánh không được để trống";

    } else if (
      cinemaName.trim().length < 3
    ) {

      newErrors.name =
        "Tên chi nhánh tối thiểu 3 ký tự";
    }

    // CITY
    if (!city.trim()) {

      newErrors.city =
        "Thành phố không được để trống";
    }

    // ADDRESS
    if (!address.trim()) {

      newErrors.address =
        "Địa chỉ không được để trống";

    } else if (
      address.trim().length < 5
    ) {

      newErrors.address =
        "Địa chỉ quá ngắn";
    }

    // HOURS
    if (
      !hoursPerRoom ||
      hoursPerRoom <= 0
    ) {

      newErrors.hoursPerRoom =
        "Số giờ hoạt động phải lớn hơn 0";

    } else if (
      hoursPerRoom > 24
    ) {

      newErrors.hoursPerRoom =
        "Không được lớn hơn 24 giờ";
    }

    setErrors(newErrors);

    return Object.keys(newErrors)
      .length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!validateForm()) {

      toast.error(
        "Vui lòng kiểm tra lại dữ liệu"
      );

      return;
    }

    setIsSubmitting(true);

    const mode =
      initialData
        ? "Cập nhật"
        : "Khởi tạo";

    const loadingToast =
      toast.loading(
        `Đang ${mode.toLowerCase()} chi nhánh...`
      );

    try {

      const url =
        initialData
          ? `/api/v1/cinema-items/${initialData.id}`
          : "/api/v1/cinema-items";

      const method =
        initialData
          ? "PUT"
          : "POST";

      const res =
        await apiSuperAdminRequest(
          url,
          {
            method,

            body: JSON.stringify({

              name:
                cinemaName.trim(),

              city:
                city.trim(),

              address:
                address.trim(),

              hoursPerRoom,

              cinemaId:
                initialData?.cinema?.id ||
                initialData?.cinemaId ||
                1,
            }),
          }
        );

      const result =
        await res.json();

      // SUCCESS
      if (res.ok) {

        toast.success(
          result?.message ||
            `${mode} chi nhánh thành công`,
          {
            id: loadingToast,
          }
        );

        onSuccess();
        onClose();

        return;
      }

      // BACKEND ERROR
      toast.error(
        result?.message ||
          result?.error ||
          "Không thể xử lý dữ liệu",
        {
          id: loadingToast,
        }
      );

    } catch (err: any) {

      console.error(err);

      toast.error(
        "Lỗi kết nối máy chủ",
        {
          id: loadingToast,
        }
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  // ================= UI =================
  return (

    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >

      <div
        className="w-full max-w-[500px] bg-[#080808] border-l border-white/10 h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">

              {initialData
                ? <Save size={20} />
                : <Zap
                    size={20}
                    className="fill-white"
                  />
              }

            </div>

            <div>

              <h2 className="text-xl font-black uppercase italic tracking-tight text-white">

                {initialData
                  ? "Edit Branch"
                  : "New Branch"
                }

              </h2>

              <p className="text-[9px] font-bold text-red-600 uppercase tracking-[0.3em]">

                {initialData
                  ? `Đang chỉnh sửa ID: ${initialData.id}`
                  : "Khởi tạo chi nhánh mới"
                }

              </p>

            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <div className="flex-1 overflow-y-auto p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* NAME */}
            <div className="space-y-3">

              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">

                <Building2
                  size={12}
                  className="text-red-600"
                />

                Tên chi nhánh
              </label>

              <input
                type="text"
                value={cinemaName}
                disabled={isSubmitting}
                onChange={(e) =>
                  setCinemaName(
                    e.target.value
                  )
                }
                placeholder="VD: CGV Vincom Quận 1"
                className={`w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-white outline-none transition-all
                ${
                  errors.name
                    ? "border-red-500"
                    : "border-white/10 focus:border-red-600/50"
                }`}
              />

              {errors.name && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* CITY */}
            <div className="space-y-3">

              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">

                <MapPin
                  size={12}
                  className="text-red-600"
                />

                Thành phố
              </label>

              <input
                type="text"
                value={city}
                disabled={isSubmitting}
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
                className={`w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-white outline-none transition-all
                ${
                  errors.city
                    ? "border-red-500"
                    : "border-white/10 focus:border-red-600/50"
                }`}
              />

              {errors.city && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.city}
                </p>
              )}
            </div>

            {/* ADDRESS */}
            <div className="space-y-3">

              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">

                <Info
                  size={12}
                  className="text-red-600"
                />

                Địa chỉ
              </label>

              <textarea
                value={address}
                disabled={isSubmitting}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Nhập địa chỉ chi nhánh..."
                className={`w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-white outline-none transition-all resize-none
                ${
                  errors.address
                    ? "border-red-500"
                    : "border-white/10 focus:border-red-600/50"
                }`}
              />

              {errors.address && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.address}
                </p>
              )}
            </div>

            {/* HOURS */}
            <div className="space-y-3">

              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">

                <Clock3
                  size={12}
                  className="text-red-600"
                />

                Giờ hoạt động / phòng
              </label>

              <input
                type="number"
                min={1}
                max={24}
                value={hoursPerRoom}
                disabled={isSubmitting}
                onChange={(e) =>
                  setHoursPerRoom(
                    Number(
                      e.target.value
                    )
                  )
                }
                className={`w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-white outline-none transition-all
                ${
                  errors.hoursPerRoom
                    ? "border-red-500"
                    : "border-white/10 focus:border-red-600/50"
                }`}
              />

              {errors.hoursPerRoom && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.hoursPerRoom}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-red-600 hover:text-white disabled:opacity-40 flex items-center justify-center gap-3"
            >

              {isSubmitting ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <>
                  {initialData
                    ? "Lưu thay đổi"
                    : "Khởi tạo chi nhánh"
                  }

                  <ChevronRight
                    size={18}
                  />
                </>
              )}
            </button>

          </form>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-white/5 bg-black/20">

          <div className="flex items-start gap-4">

            <div className="p-2 bg-red-600/10 rounded-lg">
              <ShieldCheck
                size={16}
                className="text-red-600"
              />
            </div>

            <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">

              Không thể xoá chi nhánh nếu vẫn còn suất chiếu đang hoạt động.
              Tên chi nhánh trong cùng cụm rạp không được trùng nhau.

            </p>

          </div>
        </div>
      </div>
    </div>
  );
}