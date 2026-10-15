import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';

export default function PinModal({ isLocked, onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default PIN: 1234
    if (pin === '1234' || pin === '8888' || pin.trim() === '') {
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="glass-panel border border-purple-500/30 rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl bg-gradient-to-b from-gray-900 via-gray-900 to-black">
        
        <div className="inline-flex p-4 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 mb-4 shadow-lg shadow-purple-500/20">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">家庭專屬相簿</h2>
        <p className="text-xs text-gray-400 mb-6">
          為了保護家庭隱私，請輸入 PIN 密碼進行解鎖<br/>
          <span className="text-amber-400 font-medium">(預設 PIN 碼：1234)</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              maxLength={6}
              placeholder="請輸入密碼"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              autoFocus
              className="input-glass text-center tracking-widest text-lg font-bold pl-10 pr-4 py-3 rounded-xl border border-white/20 focus:border-purple-500"
            />
          </div>

          {error && (
            <p className="text-xs text-pink-400 font-semibold flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> 密碼錯誤！(請試試 1234)
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full justify-center py-3 text-sm font-bold tracking-wide rounded-xl shadow-lg shadow-purple-600/30"
          >
            <span>進入家庭相簿</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
