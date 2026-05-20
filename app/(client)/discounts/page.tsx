"use client";
import React, { useState, useEffect } from 'react';
import { Ticket, Loader2, Copy, CheckCircle2, Heart, Coins, Sparkles } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

export default function MyVoucherWallet() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [marketVouchers, setMarketVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'market'>('my');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem('token_user') : null;
    try {
      if (activeTab === 'my') {
        const res = await apiRequest('/api/v1/vouchers/my-vouchers', { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await res.json();
        setVouchers(Array.isArray(result.data) ? result.data : []);
      } else {
        const res = await apiRequest('/api/v1/vouchers/redeemable');
        const result = await res.json();
        // Xử lý dữ liệu trả về dù là mảng hay object chứa data
        const data = Array.isArray(result) ? result : (result.data || []);
        setMarketVouchers(data);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleRedeem = async (id: number) => {
    try {
      const res = await apiRequest(`/api/v1/vouchers/redeem/${id}`, { method: 'POST' });
      if (res.ok) { alert("Đổi thành công!"); fetchData(); }
      else alert("Đổi thất bại: " + await res.text());
    } catch (e) { alert("Lỗi kết nối"); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 pb-20 font-sans p-4">
      <div className="max-w-2xl mx-auto pt-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-black mx-auto rounded-3xl flex items-center justify-center mb-4 shadow-2xl shadow-red-600/20">
            <Ticket size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">VOUCHER BOX</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase mt-1">Quản lý & Đổi ưu đãi độc quyền</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#0c0c0e] p-1.5 rounded-2xl border border-zinc-900 mb-8">
          <button onClick={() => setActiveTab('my')} className={`flex-1 py-3 font-black text-[11px] uppercase rounded-xl transition ${activeTab === 'my' ? 'bg-red-600 text-white' : 'hover:text-white'}`}>Ví của tôi</button>
          <button onClick={() => setActiveTab('market')} className={`flex-1 py-3 font-black text-[11px] uppercase rounded-xl transition ${activeTab === 'market' ? 'bg-red-600 text-white' : 'hover:text-white'}`}>Đổi điểm</button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'my' ? (
              vouchers.map(v => <VoucherCard key={v.id} voucher={v} />)
            ) : (
              marketVouchers.map(v => (
                <div key={v.id} className="bg-[#0c0c0e] p-5 rounded-3xl border border-zinc-800 flex items-center justify-between hover:border-red-600/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-zinc-800"><Coins className="text-yellow-500" size={20}/></div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{v.title}</h3>
                      <p className="text-red-500 text-[10px] font-black italic">{v.costPoints} ĐIỂM</p>
                    </div>
                  </div>
                  <button onClick={() => handleRedeem(v.id)} className="bg-zinc-900 hover:bg-red-600 text-[10px] font-black uppercase px-4 py-2 rounded-xl">Đổi ngay</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VoucherCard({ voucher }: { voucher: any }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-[#0c0c0e] p-1 rounded-[2rem] border border-zinc-900 hover:border-red-600/30 transition shadow-lg">
      <div className="flex items-center gap-4 bg-[#050505] p-4 rounded-[1.8rem]">
        <div className="w-16 h-16 bg-gradient-to-tr from-zinc-900 to-black rounded-2xl flex flex-col items-center justify-center border border-zinc-800">
          <span className="text-xs font-bold text-red-500 uppercase italic">Off</span>
          <span className="text-lg font-black text-white italic">{voucher.discountValue}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm">{voucher.title}</h3>
          <p className="text-[10px] text-zinc-600 uppercase font-bold">{voucher.cinemaItem?.name || "Hệ thống"}</p>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(voucher.code); setCopied(true); }} className="bg-zinc-900 p-3 rounded-2xl hover:text-white transition">
          {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}