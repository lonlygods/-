# PDF.js 字体丢失问题解决方案

这个项目提供了完整的 PDF.js 中文字体显示问题解决方案，包括字体预加载、字体映射、备用字体机制等功能。

## 问题描述

在使用 PDF.js 显示中文 PDF 文件时，经常会遇到以下问题：

1. **字体显示为方块或乱码**
2. **中文字符无法正确渲染**
3. **字体文件加载失败**
4. **CORS 跨域问题导致字体无法加载**

## 解决方案

### 1. 字体预加载机制

项目实现了完整的字体预加载系统，在页面加载时自动预加载常用中文字体：

```javascript
// 自动预加载字体
window.addEventListener('load', function() {
    PDFFontFix.preloadFonts().then(() => {
        console.log('字体预加载完成');
    });
});
```

### 2. 字体映射系统

提供了完整的字体映射机制，将 PDF 中的字体名称映射到实际的字体文件：

```javascript
const fontMap = {
    'SimSun': '/fonts/simsun.ttf',
    'SimHei': '/fonts/simhei.ttf',
    'Microsoft YaHei': '/fonts/msyh.ttf',
    'KaiTi': '/fonts/kaiti.ttf',
    'FangSong': '/fonts/fangsong.ttf'
    // ... 更多字体映射
};
```

### 3. 备用字体机制

当主要字体加载失败时，自动使用备用字体：

```javascript
const fallbackMap = {
    'SimSun': { name: 'Microsoft YaHei', url: '/fonts/msyh.ttf' },
    'SimHei': { name: 'Microsoft YaHei', url: '/fonts/msyh.ttf' },
    // ... 更多备用字体
};
```

### 4. CORS 问题解决

服务器端正确设置了字体文件的 MIME 类型和 CORS 头：

```javascript
app.get('/fonts/:fontName', (req, res) => {
    // 设置正确的 MIME 类型
    const mimeTypes = {
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(fontPath);
});
```

## 安装和使用

### 1. 安装依赖

```bash
npm install
```

### 2. 添加字体文件

将所需的中文字体文件放置在 `fonts/` 目录中：

```
fonts/
├── simsun.ttf      # 宋体
├── simhei.ttf      # 黑体
├── msyh.ttf        # 微软雅黑
├── kaiti.ttf       # 楷体
├── fangsong.ttf    # 仿宋
└── ...
```

### 3. 启动服务器

```bash
npm start
```

### 4. 访问应用

打开浏览器访问 `http://localhost:3000`

## 项目结构

```
├── package.json           # 项目依赖配置
├── server.js             # Express 服务器
├── public/
│   ├── index.html        # 主页面
│   └── pdf-font-fix.js   # 字体修复工具类
├── fonts/
│   ├── README.md         # 字体说明文档
│   └── *.ttf            # 字体文件
└── README.md            # 项目说明文档
```

## 核心功能

### PDFFontFix 类

提供了完整的字体管理功能：

```javascript
// 创建实例
const fontFix = new PDFFontFix();

// 预加载字体
await fontFix.preloadFonts();

// 添加自定义字体映射
fontFix.addFontMapping('CustomFont', '/fonts/custom.ttf');

// 获取字体状态
const status = fontFix.getFontStatus();
console.log(status); // { total: 13, loaded: 10, loading: 2, missing: 1 }
```

### 字体状态监控

实时监控字体加载状态：

- **已加载**: 成功加载的字体数量
- **加载中**: 正在加载的字体数量
- **缺失**: 加载失败的字体数量

### 拖拽上传

支持拖拽 PDF 文件到页面进行预览。

## 常见问题解决

### 1. 字体文件路径错误

确保字体文件路径正确，并且文件名与代码中的映射一致。

### 2. CORS 跨域问题

确保服务器正确设置了字体文件的 CORS 头：

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### 3. 字体文件格式不支持

确保字体文件格式为浏览器支持的格式：
- TTF (TrueType)
- OTF (OpenType)
- WOFF (Web Open Font Format)
- WOFF2 (Web Open Font Format 2.0)

### 4. 字体文件过大

可以使用字体子集化工具减小文件大小：

```bash
# 使用 fonttools 创建子集
pyftsubset input.ttf --text="需要的文字内容" --output-file=output.ttf
```

## 浏览器兼容性

- Chrome 35+
- Firefox 41+
- Safari 10+
- Edge 12+

## 性能优化建议

1. **字体压缩**: 使用 WOFF2 格式压缩字体文件
2. **字体子集化**: 只包含需要的字符
3. **懒加载**: 按需加载字体文件
4. **缓存**: 利用浏览器缓存机制

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。