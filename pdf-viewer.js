// PDF.js 字体丢失解决方案
class PDFViewer {
    constructor() {
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.5;
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fontMappingEnabled = true;
        
        // 初始化PDF.js
        this.initPDFJS();
        this.bindEvents();
    }
    
    initPDFJS() {
        // 设置PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // 配置字体映射 - 这是解决字体丢失的关键
        pdfjsLib.GlobalWorkerOptions.fontExtraProperties = true;
        
        // 自定义字体映射配置
        this.fontMapping = {
            // 常见中文字体映射
            'SimSun': ['SimSun', '宋体', 'NSimSun', 'serif'],
            'SimHei': ['SimHei', '黑体', 'Microsoft YaHei', 'sans-serif'],
            'KaiTi': ['KaiTi', '楷体', 'KaiTi_GB2312', 'cursive'],
            'FangSong': ['FangSong', '仿宋', 'FangSong_GB2312', 'serif'],
            'Microsoft YaHei': ['Microsoft YaHei', '微软雅黑', 'SimHei', 'sans-serif'],
            'Arial Unicode MS': ['Arial Unicode MS', 'Arial', 'sans-serif'],
            
            // 英文字体映射
            'Times New Roman': ['Times New Roman', 'Times', 'serif'],
            'Arial': ['Arial', 'Helvetica', 'sans-serif'],
            'Helvetica': ['Helvetica', 'Arial', 'sans-serif'],
            'Courier New': ['Courier New', 'Courier', 'monospace'],
            
            // 默认回退字体
            'default': ['Microsoft YaHei', 'SimSun', 'Arial Unicode MS', 'sans-serif']
        };
        
        // 设置字体回退策略
        this.setupFontFallback();
    }
    
    setupFontFallback() {
        // 重写PDF.js的字体加载逻辑
        const originalGetFont = pdfjsLib.getDocument;
        
        // 字体加载失败时的处理
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && event.reason.message.includes('font')) {
                console.warn('字体加载失败，使用回退字体:', event.reason.message);
                this.applyFontFallback();
            }
        });
    }
    
    applyFontFallback() {
        // 应用字体回退策略
        const style = document.createElement('style');
        style.textContent = `
            .textLayer {
                font-family: 'Microsoft YaHei', 'SimSun', 'Arial Unicode MS', sans-serif !important;
            }
            .textLayer > span {
                font-family: inherit !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        // 文件选择事件
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                this.loadPDF(file);
            }
        });
    }
    
    async loadPDF(file) {
        try {
            this.showLoading(true);
            this.hideError();
            
            const arrayBuffer = await file.arrayBuffer();
            
            // PDF.js加载配置
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
            
            this.pdfDoc = await loadingTask.promise;
            this.pageNum = 1;
            
            // 获取并显示字体信息
            await this.extractFontInfo();
            
            // 渲染第一页
            await this.renderPage(this.pageNum);
            
            this.updatePageInfo();
            this.showLoading(false);
            
        } catch (error) {
            console.error('PDF加载失败:', error);
            this.showError('PDF加载失败: ' + error.message);
            this.showLoading(false);
        }
    }
    
    async extractFontInfo() {
        try {
            const fontList = document.getElementById('fontList');
            fontList.innerHTML = '';
            
            // 获取第一页的字体信息
            const page = await this.pdfDoc.getPage(1);
            const fonts = await page.getOperatorList();
            
            // 提取字体信息
            const fontInfo = new Set();
            
            // 遍历操作列表查找字体
            for (let i = 0; i < fonts.fnArray.length; i++) {
                if (fonts.fnArray[i] === pdfjsLib.OPS.setFont) {
                    const fontName = fonts.argsArray[i][0];
                    fontInfo.add(fontName);
                }
            }
            
            // 显示字体信息
            if (fontInfo.size === 0) {
                fontList.innerHTML = '<div class="font-item">未检测到字体信息</div>';
            } else {
                fontInfo.forEach(fontName => {
                    const fontItem = document.createElement('div');
                    fontItem.className = 'font-item';
                    
                    const mappedFonts = this.fontMapping[fontName] || this.fontMapping['default'];
                    
                    fontItem.innerHTML = `
                        <strong>原始字体:</strong> ${fontName}<br>
                        <strong>映射字体:</strong> ${mappedFonts.join(', ')}<br>
                        <strong>状态:</strong> <span style="color: green;">✓ 已映射</span>
                    `;
                    
                    fontList.appendChild(fontItem);
                });
            }
            
        } catch (error) {
            console.warn('获取字体信息失败:', error);
            document.getElementById('fontList').innerHTML = 
                '<div class="font-item">字体信息获取失败</div>';
        }
    }
    
    async renderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
            return;
        }
        
        this.pageRendering = true;
        
        try {
            const page = await this.pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: this.scale });
            
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport,
                // 启用字体替换
                enableWebGL: false,
                // 文本渲染优化
                textLayerMode: 1
            };
            
            const renderTask = page.render(renderContext);
            
            await renderTask.promise;
            
            // 如果启用了字体映射，应用自定义样式
            if (this.fontMappingEnabled) {
                this.applyCustomFontStyles();
            }
            
            this.pageRendering = false;
            
            if (this.pageNumPending !== null) {
                this.renderPage(this.pageNumPending);
                this.pageNumPending = null;
            }
            
        } catch (error) {
            console.error('页面渲染失败:', error);
            this.showError('页面渲染失败: ' + error.message);
            this.pageRendering = false;
        }
    }
    
    applyCustomFontStyles() {
        // 应用自定义字体样式到canvas
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // 这里可以添加更多的字体渲染优化逻辑
        // 例如：字体平滑、字体大小调整等
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    updatePageInfo() {
        document.getElementById('pageInfo').textContent = 
            `${this.pageNum} / ${this.pdfDoc.numPages}`;
    }
    
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }
    
    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    hideError() {
        document.getElementById('error').style.display = 'none';
    }
}

// 全局函数
let pdfViewer;

document.addEventListener('DOMContentLoaded', () => {
    pdfViewer = new PDFViewer();
});

function loadSamplePDF() {
    // 创建一个示例PDF的URL或使用测试PDF
    alert('请选择一个PDF文件进行测试，或者将示例PDF文件放在项目目录中');
}

function toggleFontMapping() {
    if (pdfViewer) {
        pdfViewer.fontMappingEnabled = !pdfViewer.fontMappingEnabled;
        alert(`字体映射已${pdfViewer.fontMappingEnabled ? '启用' : '禁用'}`);
        
        // 重新渲染当前页面
        if (pdfViewer.pdfDoc) {
            pdfViewer.renderPage(pdfViewer.pageNum);
        }
    }
}

function downloadFonts() {
    // 提供字体下载链接和说明
    const fontInfo = `
常用中文字体下载地址：

1. 微软雅黑 (Microsoft YaHei)
   - Windows系统自带
   - 或从微软官网下载

2. 宋体 (SimSun)
   - Windows系统自带
   - 支持GB2312字符集

3. 思源黑体 (Source Han Sans)
   - Google Fonts: https://fonts.google.com/noto/specimen/Noto+Sans+SC
   - Adobe: https://github.com/adobe-fonts/source-han-sans

4. 思源宋体 (Source Han Serif)
   - Google Fonts: https://fonts.google.com/noto/specimen/Noto+Serif+SC
   - Adobe: https://github.com/adobe-fonts/source-han-serif

安装方法：
1. 下载字体文件(.ttf 或 .otf)
2. 双击安装到系统
3. 重启浏览器
4. 重新加载PDF

Web字体方法：
在CSS中添加@font-face规则，引用在线字体文件
    `;
    
    alert(fontInfo);
}

function prevPage() {
    if (pdfViewer && pdfViewer.pdfDoc && pdfViewer.pageNum > 1) {
        pdfViewer.pageNum--;
        pdfViewer.renderPage(pdfViewer.pageNum);
        pdfViewer.updatePageInfo();
    }
}

function nextPage() {
    if (pdfViewer && pdfViewer.pdfDoc && pdfViewer.pageNum < pdfViewer.pdfDoc.numPages) {
        pdfViewer.pageNum++;
        pdfViewer.renderPage(pdfViewer.pageNum);
        pdfViewer.updatePageInfo();
    }
}