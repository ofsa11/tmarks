/**
 * 可排序的快捷方式项组件
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNewtabStore } from '../hooks/useNewtabStore';
import type { Shortcut } from '../types';

interface SortableShortcutItemProps {
  shortcut: Shortcut;
  style?: 'icon' | 'card';
  onContextMenu?: (e: React.MouseEvent, shortcut: Shortcut) => void;
}

export function SortableShortcutItem({ shortcut, onContextMenu }: SortableShortcutItemProps) {
  const { incrementClickCount } = useNewtabStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shortcut.id });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const handleClick = () => {
    if (!isDragging) {
      incrementClickCount(shortcut.id);
      window.location.href = shortcut.url;
    }
  };

  const getFaviconUrl = () => {
    if (shortcut.favicon) return shortcut.favicon;
    try {
      const domain = new URL(shortcut.url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      {...attributes}
      {...listeners}
      className={`
        relative flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) {
          onContextMenu(e, shortcut);
        }
      }}
    >
      {/* 正方形圆角图标 - mtab 风格，图标填满容器 */}
      <div
        className={`
          w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden
          hover:bg-white/20 hover:scale-110 transition-all duration-200
          ${isDragging ? 'shadow-xl ring-2 ring-white/30 scale-105' : ''}
        `}
      >
        {/* 图标 - 完全填满容器 */}
        {getFaviconUrl() ? (
          <img
            src={getFaviconUrl()}
            alt={shortcut.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback-letter')) {
                const span = document.createElement('span');
                span.className = 'fallback-letter text-xl font-medium text-white/70';
                span.textContent = shortcut.title.charAt(0).toUpperCase();
                parent.appendChild(span);
              }
            }}
          />
        ) : (
          <span className="text-xl font-medium text-white/70">
            {shortcut.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* 标题 - 在容器外面 */}
      <span className="text-xs text-white/80 truncate max-w-[60px] text-center">
        {shortcut.title}
      </span>
    </div>
  );
}
