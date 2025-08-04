@echo off
chcp 65001 >nul
title PDF.js 字体修复项目

echo 🚀 PDF.js 字体修复项目启动中...
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

echo ✅ Node.js 版本: 
node --version
echo ✅ npm 版本: 
npm --version
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 安装项目依赖...
    npm install
)

REM 检查字体目录是否存在
if not exist "fonts" (
    echo 📁 创建字体目录...
    mkdir fonts
)

REM 检查字体文件是否存在
set font_count=0
for /r fonts %%f in (*.ttf *.otf *.woff *.woff2) do set /a font_count+=1

if %font_count%==0 (
    echo ⚠️  警告: 未找到字体文件
    echo 💡 建议运行以下命令下载开源字体:
    echo    npm run download-fonts
    echo.
    echo 或者手动将字体文件放置在 fonts/ 目录中
    echo 参考 fonts/README.md 获取更多信息
    echo.
    set /p choice="是否现在下载字体文件? (y/n): "
    if /i "%choice%"=="y" (
        echo 📥 下载字体文件...
        npm run download-fonts
    )
)

echo.
echo 🌐 启动服务器...
echo 📱 访问地址: http://localhost:3000
echo 🛑 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
npm start

pause