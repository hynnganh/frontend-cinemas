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

      if (res.ok) {
        const roles: string[] = result.data.roles || [];
        const token = result.data.token;

        // Lưu thông tin vào LocalStorage
        localStorage.setItem('token', token);
        localStorage.setItem('roles', JSON.stringify(roles));

        // Xác định vai trò chính và đường dẫn điều hướng
        let targetPath = '/';
        let primaryRole = 'ROLE_USER';

        // Thứ tự kiểm tra quyền ưu tiên từ cao xuống thấp
        if (roles.includes('ROLE_SUPER_ADMIN')) {
          targetPath = '/super-admin';
          primaryRole = 'ROLE_SUPER_ADMIN';
        } else if (roles.includes('ROLE_ADMIN')) {
          targetPath = '/admin';
          primaryRole = 'ROLE_ADMIN';
        } else {
          targetPath = '/';
          primaryRole = 'ROLE_USER';
        }

        // Lưu Cookie (Hết hạn sau 7 ngày)
        Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' }); 
        Cookies.set('role', primaryRole, { expires: 7 });
        
        toast.success(`Chào mừng trở lại! Quyền ${primaryRole.split('_').pop()} đã được xác thực.`);
        
        setTimeout(() => {
          router.push(targetPath);
        }, 2000);

      } else {
        toast.error(result.message || "Email hoặc mật khẩu không chính xác. Vui lòng thử lại!");
      }
    } catch (err) {
      toast.error("Hệ thống A&K Cinema hiện không phản hồi. Vui lòng kiểm tra kết nối mạng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem'
          }
        }} 
      />
      
      {/* Hiệu ứng ánh sáng Cinema (Glow Effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 space-y-10">
        {/* Khu vực Logo A&K */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-zinc-900 border border-white/5 mb-2 shadow-[0_0_40px_rgba(220,38,38,0.2)] ring-1 ring-white/10 group hover:ring-red-600/50 transition-all duration-700 cursor-pointer">
            <Film size={48} className="text-red-600 group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="space-y-1">
            <h1 className="text-6xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
              A&K<span className="text-red-600"> CINEMA</span>
            </h1>
            <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.6em] pl-2">
              Hệ thống quản trị nội bộ
            </p>
          </div>
        </div>

        {/* Khung đăng nhập */}
        <div className="bg-zinc-900/30 backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <Ticket className="absolute -right-8 -top-8 text-white/[0.02] -rotate-12" size={200} />
          
          <form onSubmit={handleLogin} className="space-y-7 relative z-10">
            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-[0.3em]">
                Tài khoản Email
              </label>
              <div className="group relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
                <input 
                  type="email"
                  name="email" // QUAN TRỌNG
                  autoComplete="username" // QUAN TRỌNG: Giúp trình duyệt hiểu đây là tài khoản
                  placeholder="admin@akcinema.com"
                  className="w-full bg-black/60 border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 outline-none text-white focus:border-red-600/50 focus:bg-black/80 transition-all font-bold placeholder:text-zinc-800 shadow-inner"
                  value={formData.email} // Nên thêm value để đồng bộ state
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-[0.3em]">
                Mật mã bảo mật
              </label>
              <div className="group relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password" // QUAN TRỌNG
                  autoComplete="current-password" // QUAN TRỌNG: Giúp trình duyệt hiểu đây là mật khẩu đi kèm tài khoản trên
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-16 outline-none text-white focus:border-red-600/50 focus:bg-black/80 transition-all font-bold placeholder:text-zinc-800 shadow-inner"
                  value={formData.password} // Nên thêm value để đồng bộ state
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-red-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white py-6 mt-4 rounded-[1.5rem] font-[1000] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_30px_rgba(220,38,38,0.2)] group overflow-hidden relative"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-3">
                    Xác nhận đăng nhập <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-4">
                <span className="w-12 h-[1px] bg-zinc-900"></span>
                Chỉ dành cho nhân viên ủy quyền
                <span className="w-12 h-[1px] bg-zinc-900"></span>
            </p>
        </div>
      </div>
    </div>
  );
}