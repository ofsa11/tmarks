/**
 * 检查快照表是否存在
 * 运行: node scripts/check-snapshot-table.js
 */

console.log('📋 快照表检查脚本')
console.log('=' .repeat(50))
console.log('')
console.log('请在 Cloudflare Dashboard 中执行以下 SQL 查询：')
console.log('')
console.log('1. 检查 bookmark_snapshots 表是否存在：')
console.log('   SELECT name FROM sqlite_master WHERE type="table" AND name="bookmark_snapshots";')
console.log('')
console.log('2. 如果表不存在，运行迁移：')
console.log('   wrangler d1 migrations apply tmarks-prod-db --remote')
console.log('')
console.log('3. 或者在 Cloudflare Dashboard 中手动执行迁移文件：')
console.log('   migrations/add_snapshots.sql')
console.log('')
console.log('=' .repeat(50))
