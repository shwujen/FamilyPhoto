import React from 'react';
import { Folder, Image, Heart, ChevronRight, X, FolderTree } from 'lucide-react';

export default function FolderBreadcrumbs({
  selectedAlbum,
  setSelectedAlbum,
  photoCount = 0,
  onOpenMobileSidebar
}) {
  const isAll = selectedAlbum === '全部照片';
  const isFav = selectedAlbum === '精選最愛';

  // 解析巢狀路徑 (例如 "家庭照片 / 92-05-01生活照")
  const pathParts = (!isAll && !isFav) ? selectedAlbum.split(' / ').map(p => p.trim()).filter(Boolean) : [];

  return (
    <div className="glass-panel rounded-2xl px-4 py-3 mb-6 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center flex-wrap gap-1.5 text-xs">
        {/* 手機版開啟目錄按鈕 */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 font-medium mr-1"
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>目錄</span>
        </button>

        {/* 根節點: 全部照片 */}
        <button
          onClick={() => setSelectedAlbum('全部照片')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            isAll 
              ? 'bg-purple-600/30 text-purple-200 font-semibold border border-purple-500/40' 
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Image className="w-3.5 h-3.5 text-purple-400" />
          <span>全部照片</span>
        </button>

        {isFav && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-600/30 text-pink-200 font-semibold border border-pink-500/40">
              <Heart className="w-3.5 h-3.5 fill-current text-pink-400" />
              <span>精選最愛</span>
            </span>
          </>
        )}

        {pathParts.map((part, index) => {
          const currentPath = pathParts.slice(0, index + 1).join(' / ');
          const isLast = index === pathParts.length - 1;

          return (
            <React.Fragment key={currentPath}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <button
                onClick={() => setSelectedAlbum(currentPath)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all max-w-[200px] truncate ${
                  isLast
                    ? 'bg-cyan-500/20 text-cyan-200 font-semibold border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title={part}
              >
                <Folder className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{part}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* 右側資訊標籤與清除篩選 */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400">
          共 <span className="font-semibold text-gray-200">{photoCount}</span> 張相片
        </span>

        {!isAll && (
          <button
            onClick={() => setSelectedAlbum('全部照片')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-gray-200 transition-all text-[11px]"
            title="回到全部照片"
          >
            <X className="w-3 h-3" />
            <span>重設</span>
          </button>
        )}
      </div>
    </div>
  );
}
