const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 CORS
app.use(cors());

// 静态文件服务
app.use(express.static('public'));

// 提供 PDF.js 字体文件
app.use('/pdfjs-dist', express.static(path.join(__dirname, 'node_modules/pdfjs-dist')));

// 提供自定义字体文件
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 字体文件路由
app.get('/fonts/:fontName', (req, res) => {
  const fontName = req.params.fontName;
  const fontPath = path.join(__dirname, 'fonts', fontName);
  
  // 设置正确的 MIME 类型
  const ext = path.extname(fontName).toLowerCase();
  const mimeTypes = {
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(fontPath);
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('PDF.js 字体修复服务已启动');
});