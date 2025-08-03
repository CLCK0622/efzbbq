#!/bin/bash

# Likes表部署脚本
# 使用方法: ./scripts/deploy-likes-table.sh

set -e

echo "🚀 开始部署Likes表..."

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 错误: 未设置DATABASE_URL环境变量"
    echo "请设置DATABASE_URL环境变量，例如:"
    echo "export DATABASE_URL='postgresql://username:password@host:port/database'"
    exit 1
fi

echo "📊 检查likes表是否存在..."
psql $DATABASE_URL -f scripts/check-likes-table.sql

echo "🔧 创建likes表..."
psql $DATABASE_URL -f scripts/migrate-add-likes-table.sql

echo "✅ 验证表结构..."
psql $DATABASE_URL -f scripts/test-likes-table.sql

echo "🎉 Likes表部署完成！"
echo ""
echo "下一步："
echo "1. 重启你的应用服务器"
echo "2. 刷新浏览器页面"
echo "3. 测试点赞功能"
echo ""
echo "如果遇到问题，请查看 LIKES_TABLE_SETUP.md 文档" 