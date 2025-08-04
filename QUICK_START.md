# PDF.js 字体修复 - 快速使用指南

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

### 方法二：手动启动

1. **安装依赖**
```bash
npm install
```

2. **下载字体文件**
```bash
npm run download-fonts
```

3. **启动服务器**
```bash
npm start
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 📁 项目结构

```
pdfjs-font-fix/
├── package.json              # 项目配置
├── server.js                 # Express 服务器
├── start.sh                  # Linux/macOS 启动脚本
├── start.bat                 # Windows 启动脚本
├── public/
│   ├── index.html            # 主页面
│   └── pdf-font-fix.js       # 字体修复工具类
├── fonts/                    # 字体文件目录
│   └── README.md             # 字体说明
├── scripts/
│   ├── download-fonts.js     # 字体下载脚本
│   └── generate-test-pdf.js  # 测试 PDF 生成脚本
└── README.md                 # 详细说明文档
```

## 🔧 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 下载字体文件
npm run download-fonts

# 生成测试 PDF
npm run generate-test-pdf

# 完整设置（安装依赖 + 下载字体 + 生成测试文件）
npm run setup
```

## 📝 使用步骤

1. **启动应用**
   - 运行启动脚本或手动执行 `npm start`

2. **上传 PDF 文件**
   - 点击"选择 PDF 文件"按钮
   - 或直接拖拽 PDF 文件到页面

3. **查看字体状态**
   - 页面顶部显示字体加载状态
   - 绿色：已加载
   - 黄色：加载中
   - 红色：缺失

4. **预览 PDF**
   - PDF 文件会在页面中渲染显示
   - 支持多页面预览

## 🎯 主要功能

### ✅ 字体预加载
- 自动预加载常用中文字体
- 实时显示字体加载状态

### ✅ 字体映射
- 将 PDF 字体名称映射到实际字体文件
- 支持自定义字体映射

### ✅ 备用字体机制
- 主要字体加载失败时自动使用备用字体
- 确保文字始终能够显示

### ✅ CORS 问题解决
- 正确设置字体文件的 MIME 类型
- 解决跨域访问问题

### ✅ 拖拽上传
- 支持拖拽 PDF 文件到页面
- 支持点击选择文件

## 🔍 故障排除

### 问题：字体显示为方块
**解决方案：**
1. 确保字体文件已正确放置在 `fonts/` 目录
2. 检查字体文件名是否与代码中的映射一致
3. 运行 `npm run download-fonts` 下载字体文件

### 问题：字体文件加载失败
**解决方案：**
1. 检查网络连接
2. 确保字体文件格式正确（TTF、OTF、WOFF、WOFF2）
3. 检查浏览器控制台是否有 CORS 错误

### 问题：PDF 无法加载
**解决方案：**
1. 确保 PDF 文件格式正确
2. 检查文件大小是否过大
3. 尝试使用不同的 PDF 文件测试

### 问题：服务器启动失败
**解决方案：**
1. 确保 Node.js 版本 >= 14
2. 检查端口 3000 是否被占用
3. 运行 `npm install` 重新安装依赖

## 📞 获取帮助

如果遇到问题，请：

1. 查看浏览器控制台的错误信息
2. 检查 `fonts/README.md` 中的字体说明
3. 参考 `README.md` 中的详细文档
4. 提交 Issue 描述问题

## 🎉 成功标志

当您看到以下情况时，说明字体修复成功：

- ✅ 字体状态显示"已加载"数量 > 0
- ✅ PDF 中的中文字符正常显示
- ✅ 没有字体相关的错误信息
- ✅ 页面渲染速度正常

---

**祝您使用愉快！** 🎊