# 快照功能迁移 - 快速指南

## ⚡ 快速步骤

### 1️⃣ 执行安全迁移脚本

在 Cloudflare D1 Console 中执行：

```sql
-- 创建 bookmark_snapshots 表和索引
-- 复制并执行 migrations/apply_snapshots_safe.sql 的全部内容
```

### 2️⃣ 添加缺失的字段

**逐个执行**以下语句（如果报错 "duplicate column name"，跳过该语句）：

```sql
-- bookmarks 表
ALTER TABLE bookmarks ADD COLUMN latest_snapshot_at TEXT;
ALTER TABLE bookmarks ADD COLUMN snapshot_count INTEGER NOT NULL DEFAULT 0;

-- user_preferences 表
ALTER TABLE user_preferences ADD COLUMN snapshot_retention_count INTEGER NOT NULL DEFAULT 5;
ALTER TABLE user_preferences ADD COLUMN snapshot_auto_create INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_preferences ADD COLUMN snapshot_auto_dedupe INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN snapshot_auto_cleanup_days INTEGER NOT NULL DEFAULT 0;
```

### 3️⃣ 验证

```sql
-- 检查表是否创建
SELECT name FROM sqlite_master WHERE type='table' AND name='bookmark_snapshots';

-- 检查 bookmarks 表字段
PRAGMA table_info(bookmarks);

-- 检查 user_preferences 表字段
PRAGMA table_info(user_preferences);
```

## ✅ 完成！

迁移完成后：
- 刷新网页
- 书签列表应该正常加载
- 快照功能完全可用

## ⚠️ 常见问题

**Q: 报错 "duplicate column name: has_snapshot"**
A: 说明该字段已存在，跳过该语句继续执行下一个

**Q: 书签列表还是 500 错误**
A: 确保 `bookmark_snapshots` 表已创建，执行验证查询检查

**Q: 如何回滚？**
A: 快照功能是可选的，即使表不存在也不影响基本功能（已添加错误处理）

## 📚 详细文档

查看 [APPLY_SNAPSHOT_MIGRATION.md](./APPLY_SNAPSHOT_MIGRATION.md) 获取完整说明。
