"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Copy, CheckCircle2, History, Ticket, X, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

export default function MyVoucherWallet() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [marketVouchers, setMarketVouchers] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState({ points: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'market'>('my');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem('token_user') : null;
    if (!token) { setLoading(false); return; }
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [userRes, voucherRes, marketRes] = await Promise.all([
        apiRequest('/api/v1/users/me', { headers }),
        apiRequest('/api/v1/vouchers/my-vouchers', { headers }),
        apiRequest('/api/v1/vouchers/redeemable', { headers })
      ]);
      const [u, v, m] = await Promise.all([userRes.json(), voucherRes.json(), marketRes.json()]);
      setUserInfo({ points: u.data?.points || 0 });
      setVouchers(v.data || []);
      setMarketVouchers(m.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  const handleOpenHistory = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem('token_user') : null;
    try {
      const res = await apiRequest('/api/v1/vouchers/point-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setPointHistory(Array.isArray(json.data) ? json.data : []);
      setIsHistoryOpen(true);
    } catch (e) { console.error("Lỗi:", e); }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* HEADER SECTION */}
        <div className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-8 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Số dư thành viên</p>
            <div className="text-5xl font-black text-white tracking-tighter flex items-end gap-2">
              {userInfo.points.toLocaleString()} 
              <span className="text-xl text-red-600 font-bold tracking-normal">Điểm</span>
            </div>
          </div>
          <button onClick={handleOpenHistory} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-full hover:bg-zinc-800 transition">
            <History size={16} /> <span className="text-xs font-bold uppercase">Lịch sử điểm</span>
          </button>
        </div>

        {/* TABS */}
        <div className="flex bg-[#0f0f0f] p-1.5 rounded-2xl border border-zinc-800 mb-6">
          {(['my', 'market'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {tab === 'my' ? 'Voucher của tôi' : 'Đổi điểm thưởng'}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>
          ) : (
            activeTab === 'my' 
              ? (vouchers.length > 0 ? vouchers.map(v => <VoucherCard key={v.id} v={v} />) : <EmptyState />)
              : (marketVouchers.length > 0 ? marketVouchers.map(v => <MarketCard key={v.id} v={v} balance={userInfo.points} onRedeem={fetchData} />) : <EmptyState />)
          )}
        </div>
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-sm rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase">Lịch sử</span>
              <button onClick={() => setIsHistoryOpen(false)}><X size={16}/></button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {pointHistory.map((h: any) => (
                <div key={h.id} className="flex justify-between items-center p-3 bg-zinc-900 rounded-lg">
                  <div>
                    <p className="text-[11px] font-bold text-white">{h.description}</p>
                    <p className="text-[9px] text-zinc-500">{new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-black ${h.type === 'ADD' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {h.type === 'ADD' ? '+' : ''}{h.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VoucherCard({ v }: { v: any }) {
  return (
    <div className="bg-[#0f0f0f] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 hover:border-zinc-600 transition">
      <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-red-600"><Ticket size={24} /></div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white">{v.title}</h4>
        <p className="text-[10px] font-mono text-zinc-500 mt-0.5 tracking-widest bg-zinc-950 px-2 py-1 inline-block rounded">{v.code}</p>
      </div>
      <button onClick={() => navigator.clipboard.writeText(v.code)} className="text-zinc-500 hover:text-white transition"><Copy size={18} /></button>
    </div>
  );
}

function MarketCard({ v, balance, onRedeem }: { v: any, balance: number, onRedeem: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const handleRedeem = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('token_user');
    await apiRequest(`/api/v1/vouchers/redeem/${v.id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    setSubmitting(false);
    onRedeem();
  };

  return (
    <div className="bg-[#0f0f0f] border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
      <div>
        <h4 className="text-sm font-bold text-white">{v.title}</h4>
        <p className="text-[11px] text-red-500 font-black mt-0.5">{v.costPoints} Điểm</p>
      </div>
      <button disabled={balance < v.costPoints || submitting} onClick={handleRedeem} 
        className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-200 disabled:opacity-20 transition">
        {submitting ? '...' : 'Đổi thưởng'}
      </button>
    </div>
  );
}

function EmptyState() {
  return <div className="text-center py-20 text-zinc-700 text-xs font-bold uppercase tracking-widest">Không có dữ liệu</div>;
}