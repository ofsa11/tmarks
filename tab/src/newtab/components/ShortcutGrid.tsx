/**
 * 快捷方式网格组件 - 支持拖拽排序
 */

import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useNewtabStore } from '../hooks/useNewtabStore';
import { SortableShortcutItem } from './SortableShortcutItem';

interface ShortcutGridProps {
  columns: 4 | 6 | 8;
  style: 'icon' | 'card';
  onAddClick?: () => void;
  onBatchEditClick?: () => void;
}

export function ShortcutGrid({ columns, style, onAddClick, onBatchEditClick }: ShortcutGridProps) {
  const { shortcuts, reorderShortcuts, getFilteredShortcuts } = useNewtabStore();

  // 获取当前分组的快捷方式
  const filteredShortcuts = getFilteredShortcuts();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 固定列数网格：图标大小一致，只通过位置区分
  const gridCols = {
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    8: 'grid-cols-8',
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = shortcuts.findIndex((s) => s.id === active.id);
    const newIndex = shortcuts.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderShortcuts(oldIndex, newIndex);
    }
  };

  // 当前分组为空时显示添加按钮（居中）
  if (filteredShortcuts.length === 0) {
    return (
      <div className="flex justify-center items-center">
        {onAddClick && (
          <button
            onClick={onAddClick}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onBatchEditClick) {
                // 显示右键菜单的逻辑由父组件处理
              }
            }}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer group"
            title="添加快捷方式"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-200">
              <Plus className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-xs text-white/60">添加</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredShortcuts.map((s) => s.id)}
        strategy={rectSortingStrategy}
      >
        <div className="flex justify-center">
          <div className={`grid ${gridCols[columns]} gap-4 justify-items-center`}>
            {filteredShortcuts.map((shortcut) => (
              <SortableShortcutItem
                key={shortcut.id}
                shortcut={shortcut}
                style={style}
                onContextMenu={onBatchEditClick ? (e) => {
                  e.preventDefault();
                  onBatchEditClick();
                } : undefined}
              />
            ))}

            {/* 添加按钮 - 在网格内部，紧挨着快捷方式 */}
            {onAddClick && (
              <button
                onClick={onAddClick}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (onBatchEditClick) {
                    onBatchEditClick();
                  }
                }}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer group"
                title="添加快捷方式 | 右键批量编辑"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-200">
                  <Plus className="w-6 h-6 text-white/60" />
                </div>
                <span className="text-xs text-white/60">添加</span>
              </button>
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
