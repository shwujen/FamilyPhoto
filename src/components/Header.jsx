import { 
  Camera, 
  Settings, 
  Lock, 
  Unlock, 
  CloudCheck, 
  CloudOff, 
  Sparkles,
  Music,
  VolumeX,
  RefreshCw,
  FolderTree
} from 'lucide-react';

export default function Header({
  isDriveConnected,
  onOpenSettings,
  onRefresh,
  isLoading,
  isLocked,
  setIsLocked,
  isPlayingBgm,
  setIsPlayingBgm,
  onToggleSidebar
}) {
  return (
    <header className="glass-panel sticky top-0 z-40 px-4 py-3 border-b border-white/10 mb-6 backdrop-blur-md">
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white shadow-lg shadow-purple-500/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight gradient-text">
                Family Vault
              </h1>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                {isDriveConnected ? (
                  <>
                    <span className="pulse-dot"></span>
                    <span>Google Drive 已連線</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>示範模式 (未連線)</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Lock & Settings button on mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:text-white"
              title="相簿目錄"
            >
              <FolderTree className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlayingBgm(!isPlayingBgm)}
              className={`p-2 rounded-xl border transition-all ${
                isPlayingBgm 
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
              }`}
              title={isPlayingBgm ? '關閉音樂' : '播放音樂'}
            >
              {isPlayingBgm ? <Music className="w-4 h-4 animate-pulse text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {isDriveConnected && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:text-white"
                title="快速重新整理同步"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button 
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              title="Drive 設定"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsLocked(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              title="鎖定相簿"
            >
              <Lock className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>

        {/* Control Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Background Music Toggle */}
          <button
            onClick={() => setIsPlayingBgm(!isPlayingBgm)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
              isPlayingBgm 
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-sm shadow-purple-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
            title={isPlayingBgm ? '關閉背景音樂' : '播放溫馨背景音樂'}
          >
            {isPlayingBgm ? <Music className="w-4 h-4 animate-pulse text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{isPlayingBgm ? '音樂中' : '配樂'}</span>
          </button>

          {/* Google Drive Status & Settings */}
          {isDriveConnected ? (
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-1">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-all text-xs font-semibold disabled:opacity-50"
                title="快速抓取 Google Drive 最新照片"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? '同步中...' : '已連線 Drive'}</span>
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-500/20 rounded-lg transition-all"
                title="Google Drive 串接設定"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenSettings}
              className="px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            >
              <CloudOff className="w-4 h-4" />
              <span>設定 Drive 串接</span>
            </button>
          )}

          {/* Privacy Lock */}
          <button
            onClick={() => setIsLocked(true)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            title="鎖定家庭相簿 (PIN 碼保護)"
          >
            <Lock className="w-4 h-4 text-purple-400" />
          </button>
        </div>

      </div>
    </header>
  );
}
