# 应用快照功能数据库迁移

## 📋 迁移说明

快照功能需要在数据库中创建新表和字段。请按照以下步骤操作：

## 🚀 方法 1：使用 Wrangler CLI（推荐）

```bash
cd tmarks
wrangler d1 migrations apply tmarks-prod-db --remote
```

## 🌐 方法 2：在 Cloudflare Dashboard 中手动执行（推荐）

### 步骤：

1. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com/

2. **进入 D1 数据库**
   - 左侧菜单：Workers & Pages → D1
   - 选择数据库：`tmarks-prod-db`

3. **打开 SQL 控制台**
   - 点击 "Console" 标签页

4. **检查现有字段**
   - 执行 `migrations/check_missing_fields.sql` 中的查询
   - 确定哪些字段已存在，哪些需要添加

5. **添加缺失的字段**
   - 打开 `migrations/add_missing_fields.sql`
   - **逐个执行**每条 ALTER TABLE 语句
   - 如果报错 "duplicate column name"，说明字段已存在，**跳过该语句**继续下一个

6. **创建表和索引**
   - 执行 `migrations/apply_snapshots_safe.sql` 的全部内容
   - 这会创建 `bookmark_snapshots` 表和所有索引

7. **验证迁移**
   - 执行以下查询验证表已创建：
   ```sql
   SELECT name FROM sqlite_master WHERE type='table' AND name='bookmark_snapshots';
   ```
   - 应该返回一行数据

## ✅ 迁移内容

此迁移将创建：

### 新表
- `bookmark_snapshots` - 存储快照元数据

### 新字段（bookmarks 表）
- `has_snapshot` - 是否有快照
- `latest_snapshot_at` - 最新快照时间
- `snapshot_count` - 快照数量

### 新字段（user_preferences 表）
- `snapshot_retention_count` - 保留快照数量（默认 5）
- `snapshot_auto_create` - 自动创建快照（默认关闭）
- `snapshot_auto_dedupe` - 自动去重（默认开启）
- `snapshot_auto_cleanup_days` - 自动清理天数（默认 0=不限制）

### 索引
- 多个优化查询性能的索引

## 🔍 检查迁移状态

执行以下 SQL 查询：

```sql
-- 检查快照表
SELECT name FROM sqlite_master WHERE type='table' AND name='bookmark_snapshots';

-- 检查迁移版本
SELECT * FROM schema_migrations WHERE version='0004';

-- 检查 bookmarks 表的新字段
PRAGMA table_info(bookmarks);
```

## ⚠️ 注意事项

1. **备份数据**：虽然此迁移是安全的（使用 IF NOT EXISTS），但建议先备份数据
2. **R2 存储桶**：确保已创建 R2 存储桶 `tmarks-snapshots`
3. **环境变量**：确保 `wrangler.toml` 中配置了 `SNAPSHOTS_BUCKET` 绑定

## 📚 相关文档

- [快照功能实现文档](./SNAPSHOT_IMPLEMENTATION.md)
- [快照功能设置指南](./SNAPSHOT_SETUP.md)

## 🆘 遇到问题？

如果迁移失败，请检查：
1. 数据库连接是否正常
2. 是否有足够的权限
3. 表名是否冲突
4. 查看 Cloudflare Dashboard 的错误日志
