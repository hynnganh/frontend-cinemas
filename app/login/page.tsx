"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Film, Loader2, ArrowRight, Ticket } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { apiRequest } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '', 
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Email hoặc mật khẩu không chính xác!");
        setLoading(false);
        return;
      }

      const roles: string[] = result.data.roles || [];
      const token: string = result.data.token;

      if (!roles.length || !token) {
        toast.error("Dữ liệu đăng nhập không hợp lệ!");
        setLoading(false);
        return;
      }

      /* =============================================
         ✅ XỬ LÝ PHÂN QUYỀN (NGĂN KÉO RIÊNG)
         ============================================== */

      const isSuperAdmin = roles.includes("ROLE_SUPER_ADMIN");
      const isAdmin = roles.includes("ROLE_ADMIN");

      let targetPath = "/";
      let tokenKey = "token_user";

      // Xác định key lưu trữ dựa trên Role
      if (isSuperAdmin) {
        targetPath = "/super-admin";
        tokenKey = "token_super_admin";
      } else if (isAdmin) {
        targetPath = "/admin";
        tokenKey = "token_admin";
      }

      // ❌ TUYỆT ĐỐI KHÔNG xóa oldKeys ở đây để 3 tab chạy song song
      // Chỉ cập nhật đúng loại token mà mình vừa đăng nhập

      // 1. Lưu vào LocalStorage (cho Client-side API)
      localStorage.setItem(tokenKey, token);
      localStorage.setItem("token", token); // Token vừa đăng nhập làm mặc định
      localStorage.setItem("roles", JSON.stringify(roles));

      // 2. Lưu vào Cookie (cho Middleware Server-side)
      // Quan trọng: Thêm path '/' để tất cả các folder đều đọc được
      Cookies.set(tokenKey, token, { expires: 7, path: '/' });
      Cookies.set("token", token, { expires: 7, path: '/' });
      Cookies.set("roles", JSON.stringify(roles), { expires: 7, path: '/' });

      /* =========================
         ✅ CHUYỂN HƯỚNG
         ========================== */
      toast.success(`Xác thực thành công! Đang truy cập vùng ${tokenKey.replace('token_', '').toUpperCase()}`);

      setTimeout(() => {
        // Sử dụng window.location.href thay vì router.push để "re-sync" toàn bộ trạng thái
        window.location.href = targetPath;
      }, 1000);

    } catch (error) {
      toast.error("Lỗi kết nối máy chủ Cinema!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-zinc-900 border border-white/5 mb-2 shadow-[0_0_50px_rgba(220,38,38,0.15)] ring-1 ring-white/10 group">
            <Film size={48} className="text-red-600 group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-[1000] italic uppercase tracking-tighter text-white">
              A&K<span className="text-red-600"> CINEMA</span>
            </h1>
            <p className="text-zinc-600 font-black uppercase text-[9px] tracking-[0.5em]">Central Management System</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <Ticket className="absolute -right-12 -top-12 text-white/[0.01] -rotate-12 pointer-events-none" size={240} />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Tài khoản</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={18} />
                <input 
                  type="email"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none text-white focus:border-red-600/40 focus:bg-black/80 transition-all font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Mật mã</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-14 outline-none text-white focus:border-red-600/40 focus:bg-black/80 transition-all font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-5 mt-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-red-600/10 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Truy cập hệ thống <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}