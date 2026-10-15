import React, { useState, useMemo, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Image, 
  Heart, 
  Search, 
  X, 
  ChevronsUpDown,
  ChevronsDownUp,
  ArrowUpDown
} from 'lucide-react';

/**
 * 將相片列表的 path / album 解析成巢狀樹狀結構
 */
function buildFolderTreeData(photos) {
  const root = {
    name: 'root',
    path: '',
    count: photos.length,
    children: {}
  };

  photos.forEach(photo => {
    // 支援 path (如 "家庭照片 / 92-05-01") 或 fallback 到 album
    const rawPath = photo.path || photo.album || '未分類相簿';
    const parts = rawPath.split(' / ').map(s => s.trim()).filter(Boolean);

    let current = root;
    parts.forEach((part, index) => {
      const currentPath = parts.slice(0, index + 1).join(' / ');
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          count: 0,
          children: {}
        };
      }
      current.children[part].count += 1;
      current = current.children[part];
    });
  });

  return root;
}

/**
 * 解析日期字串為數字比較值 (支援民國年與西元年)
 * 例如 "90-04-9" -> 20010409, "92-05-01" -> 20030501, "103-07-01" -> 20140701, "2024-04-12" -> 20240412
 */
function parseDateKey(name) {
  const trimmed = name.trim();
  const match = trimmed.match(/^(\d{2,4})(?:[-._/](\d{1,2}))?(?:[-._/](\d{1,2}))?/);
  if (!match) return null;

  let y = parseInt(match[1], 10);
  if (isNaN(y)) return null;

  // 民國年換算 (例如 90 年 -> 2001 年, 103 年 -> 2014 年)
  if (y < 200) {
    y += 1911;
  }

  const month = match[2] ? parseInt(match[2], 10) : 1;
  const day = match[3] ? parseInt(match[3], 10) : 1;

  return y * 10000 + month * 100 + day;
}

/**
 * 取得排序類型優先權：0: 日期/數字, 1: 英文, 2: 中文/其他
 */
function getFolderType(name) {
  const trimmed = name.trim();
  // 1. 日期 / 數字開頭
  if (/^\d/.test(trimmed)) return 0;
  // 2. 英文開頭 (A-Z, a-z)
  if (/^[a-zA-Z]/.test(trimmed)) return 1;
  // 3. 中文 / 其他
  return 2;
}

/**
 * 依「日期 -> 英文 -> 中文」進行資料夾節點排序
 */
function compareFolderNodes(nodeA, nodeB, direction = 'asc') {
  const typeA = getFolderType(nodeA.name);
  const typeB = getFolderType(nodeB.name);

  // 類別順序固定：0 (日期) -> 1 (英文) -> 2 (中文)
  if (typeA !== typeB) {
    return typeA - typeB;
  }

  const modifier = direction === 'desc' ? -1 : 1;

  // 1. 同為日期 / 數字
  if (typeA === 0) {
    const dateA = parseDateKey(nodeA.name);
    const dateB = parseDateKey(nodeB.name);

    if (dateA !== null && dateB !== null && dateA !== dateB) {
      return (dateA - dateB) * modifier;
    }
    return nodeA.name.localeCompare(nodeB.name, 'zh-Hant', { numeric: true, sensitivity: 'base' }) * modifier;
  }

  // 2. 同為英文
  if (typeA === 1) {
    return nodeA.name.localeCompare(nodeB.name, 'en', { numeric: true, sensitivity: 'base' }) * modifier;
  }

  // 3. 同為中文 / 其他
  return nodeA.name.localeCompare(nodeB.name, 'zh-Hant', { numeric: true }) * modifier;
}

/**
 * 樹狀節點遞迴組件
 */
function TreeNode({ 
  node, 
  depth = 0, 
  selectedAlbum, 
  onSelectAlbum, 
  expandedPaths, 
  toggleExpand,
  folderSearchQuery,
  sortDirection = 'asc' 
}) {
  const hasChildren = Object.keys(node.children).length > 0;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedAlbum === node.path || selectedAlbum === node.name;

  // 搜尋過濾：若本身或子節點符合搜尋字串才顯示
  const matchesSearch = useMemo(() => {
    if (!folderSearchQuery) return true;
    const q = folderSearchQuery.toLowerCase();
    const checkMatch = (n) => {
      if (n.name.toLowerCase().includes(q)) return true;
      return Object.values(n.children).some(checkMatch);
    };
    return checkMatch(node);
  }, [node, folderSearchQuery]);

  if (!matchesSearch) return null;

  return (
    <div className="select-none text-xs">
      <div 
        onClick={() => onSelectAlbum(node.path)}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`group flex items-center justify-between py-2 pr-2.5 my-0.5 rounded-xl cursor-pointer transition-all ${
          isSelected 
            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-md shadow-purple-500/20' 
            : 'text-gray-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.path);
              }}
              className={`p-0.5 rounded hover:bg-white/20 transition-transform ${
                isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4" /> // 佔位以保持縮排對齊
          )}

          {isExpanded && hasChildren ? (
            <FolderOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
          ) : (
            <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-cyan-400'}`} />
          )}

          <span className="truncate text-xs font-medium" title={node.name}>
            {node.name}
          </span>
        </div>

        {/* 相片數量 Badge */}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${
          isSelected 
            ? 'bg-white/20 text-white' 
            : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-gray-300'
        }`}>
          {node.count}
        </span>
      </div>

      {/* 子資料夾 */}
      {hasChildren && isExpanded && (
        <div className="border-l border-white/10 ml-3.5 pl-0.5 my-0.5">
          {Object.values(node.children)
            .sort((a, b) => compareFolderNodes(a, b, sortDirection))
            .map(child => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedAlbum={selectedAlbum}
              onSelectAlbum={onSelectAlbum}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
              folderSearchQuery={folderSearchQuery}
              sortDirection={sortDirection}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SidebarFolderTree({
  photos = [],
  selectedAlbum,
  setSelectedAlbum,
  isOpenMobile,
  onCloseMobile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  // 建立樹狀架構
  const treeData = useMemo(() => {
    return buildFolderTreeData(photos);
  }, [photos]);

  // 預設展開第 1~2 層
  useEffect(() => {
    const initialExpanded = new Set();
    Object.values(treeData.children).forEach(firstLevel => {
      initialExpanded.add(firstLevel.path);
      // 若只有單一母資料夾（如「家庭照片」），將其子層也一併展開
      if (Object.keys(treeData.children).length <= 2) {
        Object.values(firstLevel.children).forEach(secondLevel => {
          initialExpanded.add(secondLevel.path);
        });
      }
    });
    setExpandedPaths(initialExpanded);
  }, [treeData]);

  // 當搜尋時，自動展開所有符合的資料夾
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const allPaths = new Set();
    const collectPaths = (node) => {
      if (node.path) allPaths.add(node.path);
      Object.values(node.children).forEach(collectPaths);
    };
    collectPaths(treeData);
    setExpandedPaths(allPaths);
  }, [searchQuery, treeData]);

  // 切換單一資料夾展開/收合
  const toggleExpand = (path) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // 全部展開
  const expandAll = () => {
    const allPaths = new Set();
    const collectPaths = (node) => {
      if (node.path) allPaths.add(node.path);
      Object.values(node.children).forEach(collectPaths);
    };
    collectPaths(treeData);
    setExpandedPaths(allPaths);
  };

  // 全部收合
  const collapseAll = () => {
    setExpandedPaths(new Set());
  };

  // 統計精選最愛與全部照片
  const totalCount = photos.length;
  const favoriteCount = useMemo(() => {
    return photos.filter(p => p.isFavorite).length;
  }, [photos]);

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* 資料夾搜尋框（直接置頂） */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="快速篩選資料夾..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/25 border border-white/10 text-xs text-gray-200 pl-8 pr-7 py-2 rounded-xl focus:border-purple-500 focus:outline-none placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white"
            title="關閉目錄"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 快速存取固定項目 */}
      <div className="space-y-1 pb-3 mb-2 border-b border-white/10">
        <div className="text-[10px] font-semibold tracking-wider text-gray-400 px-2 uppercase mb-1">
          快速存取
        </div>

        {/* 全部相片 */}
        <button
          onClick={() => {
            setSelectedAlbum('全部照片');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            selectedAlbum === '全部照片'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-md shadow-purple-500/20'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Image className={`w-4 h-4 ${selectedAlbum === '全部照片' ? 'text-white' : 'text-purple-400'}`} />
            <span>全部相片</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            selectedAlbum === '全部照片' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* 精選最愛 */}
        <button
          onClick={() => {
            setSelectedAlbum('精選最愛');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            selectedAlbum === '精選最愛'
              ? 'bg-gradient-to-r from-pink-600 to-purple-500 text-white font-semibold shadow-md shadow-pink-500/20'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className={`w-4 h-4 fill-current ${selectedAlbum === '精選最愛' ? 'text-white' : 'text-pink-400'}`} />
            <span>精選最愛</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            selectedAlbum === '精選最愛' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'
          }`}>
            {favoriteCount}
          </span>
        </button>
      </div>

      {/* 資料夾樹狀目錄 */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1.5 space-y-0.5 custom-tree-scroll">
        <div className="text-[10px] font-semibold tracking-wider text-gray-400 px-2 uppercase mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>相簿目錄</span>
            <span className="text-[10px] text-gray-500 font-normal lowercase">
              ({Object.keys(treeData.children).length} 目錄)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={sortDirection === 'asc' ? '目前依日期由舊到新 (點擊切換新到舊)' : '目前依日期由新到舊 (點擊切換舊到新)'}
              className="px-1.5 py-0.5 rounded-md hover:bg-white/10 text-[10px] text-gray-400 hover:text-purple-300 transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <ArrowUpDown className="w-2.5 h-2.5" />
              <span>{sortDirection === 'asc' ? '舊→新' : '新→舊'}</span>
            </button>
            <button
              onClick={expandAll}
              title="全部展開"
              className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ChevronsUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={collapseAll}
              title="全部收合"
              className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ChevronsDownUp className="w-3 h-3" />
            </button>
          </div>
        </div>

        {Object.keys(treeData.children).length > 0 ? (
          Object.values(treeData.children)
            .sort((a, b) => compareFolderNodes(a, b, sortDirection))
            .map(child => (
            <TreeNode
              key={child.path}
              node={child}
              depth={0}
              selectedAlbum={selectedAlbum}
              onSelectAlbum={(path) => {
                setSelectedAlbum(path);
                if (onCloseMobile) onCloseMobile();
              }}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
              folderSearchQuery={searchQuery}
              sortDirection={sortDirection}
            />
          ))
        ) : (
          <div className="text-center py-6 text-xs text-gray-500">
            尚無資料夾
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 電腦版側邊欄 (常駐) */}
      <aside className="hidden md:block w-72 lg:w-80 shrink-0 glass-panel rounded-2xl p-4 border border-white/10 sticky top-24 h-[calc(100vh-7.5rem)] overflow-hidden shadow-2xl">
        {sidebarContent}
      </aside>

      {/* 手機版抽屜式側邊欄 */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* 背景遮罩 */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />
          {/* 抽屜內容 */}
          <div className="relative w-80 max-w-[85%] h-full bg-[#121626] border-r border-white/15 p-4 shadow-2xl z-10 animate-slide-right flex flex-col min-h-0">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
