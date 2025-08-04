#!/bin/bash

# PDF.js 字体修复项目快速启动脚本

echo "🚀 PDF.js 字体修复项目启动中..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
fi

# 检查字体目录是否存在
if [ ! -d "fonts" ]; then
    echo "📁 创建字体目录..."
    mkdir -p fonts
fi

# 检查字体文件是否存在
font_count=$(find fonts -name "*.ttf" -o -name "*.otf" -o -name "*.woff" -o -name "*.woff2" | wc -l)

if [ $font_count -eq 0 ]; then
    echo "⚠️  警告: 未找到字体文件"
    echo "💡 建议运行以下命令下载开源字体:"
    echo "   npm run download-fonts"
    echo ""
    echo "或者手动将字体文件放置在 fonts/ 目录中"
    echo "参考 fonts/README.md 获取更多信息"
    echo ""
    read -p "是否现在下载字体文件? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 下载字体文件..."
        npm run download-fonts
    fi
fi

echo "🌐 启动服务器..."
echo "📱 访问地址: http://localhost:3000"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
npm start