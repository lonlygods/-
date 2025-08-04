# PDF.js 字体丢失解决方案

这个项目演示了如何解决 PDF.js 在显示 PDF 文档时的字体丢失问题，特别是中文字体的处理。

## 问题描述

在使用 PDF.js 显示 PDF 文档时，经常会遇到以下字体相关问题：

1. **中文字体显示为方块或空白**
2. **字体样式丢失（粗体、斜体等）**
3. **特殊字符无法正确显示**
4. **字体回退机制不生效**

## 解决方案

### 1. 字体映射配置

在 `pdf-viewer.js` 中配置了完整的字体映射表：

```javascript
this.fontMapping = {
    // 常见中文字体映射
    'SimSun': ['SimSun', '宋体', 'NSimSun', 'serif'],
    'SimHei': ['SimHei', '黑体', 'Microsoft YaHei', 'sans-serif'],
    'KaiTi': ['KaiTi', '楷体', 'KaiTi_GB2312', 'cursive'],
    'FangSong': ['FangSong', '仿宋', 'FangSong_GB2312', 'serif'],
    'Microsoft YaHei': ['Microsoft YaHei', '微软雅黑', 'SimHei', 'sans-serif'],
    // 默认回退字体
    'default': ['Microsoft YaHei', 'SimSun', 'Arial Unicode MS', 'sans-serif']
};
```

### 2. PDF.js 配置优化

```javascript
const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    // 启用字体回退
    useSystemFonts: true,
    // 禁用字体面子集化，避免字体丢失
    disableFontFace: false,
    // 启用字体映射
    fontExtraProperties: true,
    // CMap URL配置，支持中文字符
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
    // 标准字体目录
    standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
});
```

### 3. CSS 字体回退

在 `fonts.css` 中定义了完整的字体回退策略：

```css
.textLayer {
    font-family: 'Noto Sans SC', 'ChineseFallback', 'Microsoft YaHei', 'SimSun', 'Arial Unicode MS', sans-serif !important;
    font-feature-settings: "kern" 1, "liga" 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
```

### 4. Web 字体支持

引入了 Google Fonts 的中文字体：

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@300;400;500;700&display=swap');
```

## 使用方法

### 1. 直接使用

1. 打开 `index.html`
2. 点击"选择文件"按钮选择 PDF 文件
3. 查看字体信息和渲染效果

### 2. 集成到现有项目

#### 方法一：直接引入

```html
<link rel="stylesheet" href="fonts.css">
<script src="pdf-viewer.js"></script>
```

#### 方法二：复制核心代码

将以下关键配置复制到你的项目中：

```javascript
// 1. PDF.js 初始化配置
pdfjsLib.GlobalWorkerOptions.fontExtraProperties = true;

// 2. 文档加载配置
const loadingTask = pdfjsLib.getDocument({
    data: pdfData,
    useSystemFonts: true,
    disableFontFace: false,
    fontExtraProperties: true,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
});

// 3. 字体回退处理
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('font')) {
        console.warn('字体加载失败，使用回退字体:', event.reason.message);
        applyFontFallback();
    }
});
```

## 常见问题解决

### 1. 字体仍然显示为方块

**解决方案：**
- 确保系统安装了中文字体
- 检查 CSS 字体回退链是否正确
- 验证 PDF.js 版本是否支持字体映射

### 2. 字体加载缓慢

**解决方案：**
- 使用本地字体文件
- 启用字体预加载
- 优化字体文件大小

```html
<link rel="preload" href="fonts/NotoSansSC-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

### 3. 特殊字符无法显示

**解决方案：**
- 使用 Arial Unicode MS 字体
- 配置正确的 CMap
- 检查字符编码

### 4. 移动端字体问题

**解决方案：**
- 使用系统字体
- 配置响应式字体大小
- 优化移动端渲染性能

## 推荐字体

### 系统字体
- **Windows:** Microsoft YaHei, SimSun, SimHei
- **macOS:** PingFang SC, STHeiti, STSong
- **Linux:** Noto Sans CJK SC, WenQuanYi Micro Hei

### Web 字体
- **Noto Sans SC** - Google 开源中文字体
- **Noto Serif SC** - Google 开源中文衬线字体
- **Source Han Sans** - Adobe 开源中文字体

## 性能优化

1. **字体预加载**
2. **字体子集化**
3. **缓存策略**
4. **延迟加载**

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个解决方案。

## 相关链接

- [PDF.js 官方文档](https://mozilla.github.io/pdf.js/)
- [Google Fonts](https://fonts.google.com/)
- [MDN Web Fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fonts)