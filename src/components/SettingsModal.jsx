import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Cloud, Code, HelpCircle, ExternalLink, RefreshCw, Eye } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  gasUrl,
  setGasUrl,
  driveFolderId,
  setDriveFolderId,
  onConnect,
  onResetDemo,
  isLoading,
  photosCount = 0,
  isDriveConnected = false
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('GAS');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sampleGASCode = `// 複製此段程式碼至 script.google.com
const FOLDER_ID = "${driveFolderId || 'YOUR_GOOGLE_DRIVE_FOLDER_ID'}";

function doGet(e) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const photos = [];
  fetchPhotos(folder, photos, folder.getName());
  return ContentService.createTextOutput(JSON.stringify({ status: "success", photos }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fetchPhotos(folder, photos, path) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (f.getMimeType().startsWith("image/")) {
      photos.push({
        id: f.getId(),
        name: f.getName(),
        album: folder.getName(),
        date: f.getDateCreated().toISOString().split('T')[0],
        url: 'https://lh3.googleusercontent.com/d/' + f.getId() + '=w1600',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/' + f.getId() + '=w800',
        viewUrl: f.getUrl()
      });
    }
  }
  const subs = folder.getFolders();
  while (subs.hasNext()) fetchPhotos(subs.next(), photos, path);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleGASCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="glass-panel border border-white/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl bg-gray-900/90 relative max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Google Drive 串接設定</h2>
              <p className="text-xs text-gray-400">免搬移照片檔案，即時讀取資料夾全數照片</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            onClick={() => setActiveTab('GAS')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'GAS' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            方式 A：Google Apps Script (推薦無伺服器 API)
          </button>
          <button
            onClick={() => setActiveTab('PUBLIC')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'PUBLIC' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            方式 B：預設示範與範例模式
          </button>
        </div>

        {activeTab === 'GAS' ? (
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center justify-between">
                <span>1. Google Apps Script Web App URL</span>
                <span className="text-rose-400 font-semibold text-[11px] normal-case">※ 必填</span>
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                className="input-glass text-xs font-mono py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center justify-between">
                <span>2. 切換特定資料夾 ID</span>
                <span className="text-gray-400 font-normal text-[11px] normal-case">選填（若未填則使用 GAS 腳本內的 FOLDER_ID）</span>
              </label>
              <input
                type="text"
                placeholder="例如: 1a2b3c4d5e6f..."
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                className="input-glass text-xs font-mono py-2.5"
              />
            </div>

            {/* Step instruction box */}
            <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Code className="w-4 h-4" /> 部署步驟教學
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已複製 API 程式碼' : '複製 GAS 端點語法'}</span>
                </button>
              </div>

              <ol className="list-decimal list-inside text-xs text-gray-300 space-y-1.5 leading-relaxed">
                <li>開啟 <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-purple-400 underline inline-flex items-center gap-0.5">script.google.com <ExternalLink className="w-3 h-3" /></a> 新增專案。</li>
                <li>貼上上方的 Apps Script 程式碼並設定 FOLDER_ID。</li>
                <li>點選右上角「部署」➔「新建部署」➔ 選擇「Web 應用程式」。</li>
                <li>誰可以存取設為「**所有人 (Anyone)**」後部署。</li>
                <li>複製產生的 Web App 網址並貼入上方欄位點擊「開始同步」。</li>
              </ol>
            </div>

            {isDriveConnected && photosCount > 0 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  已同步快取 {photosCount} 張照片，無需每次重複同步！
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-medium"
                >
                  直接看照片 ➔
                </button>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onConnect}
                disabled={isLoading}
                className="btn-primary w-full sm:flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                <span>
                  {isLoading 
                    ? '正在從 Google Drive 同步照片中...' 
                    : isDriveConnected 
                      ? '重新同步最新照片' 
                      : '立即開始連線同步'}
                </span>
              </button>

              {photosCount > 0 && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary w-full sm:w-auto px-4 py-2.5 justify-center gap-1.5 text-xs font-semibold"
                >
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>關閉並瀏覽相片</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-gray-300">
            <p className="text-xs leading-relaxed text-gray-300">
              若目前尚未準備好 Google Drive 資料夾，您可以先體驗網頁展示效果。網站內內建了包含「歷史上的今天」、「精選最愛相簿」、「露營」、「慶生」等多組家庭相片範例。
            </p>
            <div className="pt-2">
              <button
                onClick={onResetDemo}
                className="btn-secondary w-full justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>切換回示範相簿模式</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
