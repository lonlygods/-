/**
 * PDF.js 字体修复工具类
 * 解决 PDF.js 中文字体显示问题
 */
class PDFFontFix {
    constructor() {
        this.fontMap = new Map();
        this.loadedFonts = new Set();
        this.fontPromises = new Map();
        this.init();
    }

    /**
     * 初始化字体映射
     */
    init() {
        // 基础中文字体映射
        const baseFonts = {
            'SimSun': '/fonts/simsun.ttf',
            'SimHei': '/fonts/simhei.ttf',
            'Microsoft YaHei': '/fonts/msyh.ttf',
            'KaiTi': '/fonts/kaiti.ttf',
            'FangSong': '/fonts/fangsong.ttf',
            'STSong': '/fonts/stsong.ttf',
            'STZhongsong': '/fonts/stzhongsong.ttf',
            'STKaiti': '/fonts/stkaiti.ttf',
            'STFangsong': '/fonts/stfangsong.ttf',
            'STLiti': '/fonts/stliti.ttf',
            'STXingkai': '/fonts/stxingkai.ttf',
            'STHupo': '/fonts/sthupo.ttf',
            'STXihei': '/fonts/stxihei.ttf'
        };

        // 添加字体映射
        for (const [fontName, fontUrl] of Object.entries(baseFonts)) {
            this.fontMap.set(fontName, fontUrl);
        }

        // 设置 PDF.js 字体替换
        this.setupPDFJSFontReplacement();
    }

    /**
     * 设置 PDF.js 字体替换
     */
    setupPDFJSFontReplacement() {
        if (typeof pdfjsLib !== 'undefined') {
            // 重写字体加载逻辑
            const originalLoadFont = pdfjsLib.FontLoader.prototype.loadFont;
            
            pdfjsLib.FontLoader.prototype.loadFont = async function(fontName, url) {
                try {
                    // 尝试使用自定义字体映射
                    const customFontUrl = this.fontMap.get(fontName);
                    if (customFontUrl) {
                        return await originalLoadFont.call(this, fontName, customFontUrl);
                    }
                    
                    // 如果自定义字体不存在，使用原始逻辑
                    return await originalLoadFont.call(this, fontName, url);
                } catch (error) {
                    console.warn(`字体加载失败: ${fontName}`, error);
                    
                    // 尝试使用备用字体
                    const fallbackFont = this.getFallbackFont(fontName);
                    if (fallbackFont) {
                        return await originalLoadFont.call(this, fallbackFont.name, fallbackFont.url);
                    }
                    
                    throw error;
                }
            }.bind(this);
        }
    }

    /**
     * 获取备用字体
     */
    getFallbackFont(fontName) {
        const fallbackMap = {
            'SimSun': { name: 'Microsoft YaHei', url: '/fonts/msyh.ttf' },
            'SimHei': { name: 'Microsoft YaHei', url: '/fonts/msyh.ttf' },
            'KaiTi': { name: 'SimSun', url: '/fonts/simsun.ttf' },
            'FangSong': { name: 'SimSun', url: '/fonts/simsun.ttf' },
            'STSong': { name: 'SimSun', url: '/fonts/simsun.ttf' },
            'STZhongsong': { name: 'SimSun', url: '/fonts/simsun.ttf' },
            'STKaiti': { name: 'KaiTi', url: '/fonts/kaiti.ttf' },
            'STFangsong': { name: 'FangSong', url: '/fonts/fangsong.ttf' },
            'STLiti': { name: 'SimHei', url: '/fonts/simhei.ttf' },
            'STXingkai': { name: 'KaiTi', url: '/fonts/kaiti.ttf' },
            'STHupo': { name: 'SimHei', url: '/fonts/simhei.ttf' },
            'STXihei': { name: 'SimHei', url: '/fonts/simhei.ttf' }
        };

        return fallbackMap[fontName];
    }

    /**
     * 预加载字体
     */
    async preloadFonts() {
        const promises = [];
        
        for (const [fontName, fontUrl] of this.fontMap) {
            if (!this.loadedFonts.has(fontName)) {
                const promise = this.loadFont(fontName, fontUrl);
                promises.push(promise);
            }
        }

        try {
            await Promise.allSettled(promises);
            console.log('字体预加载完成');
        } catch (error) {
            console.warn('部分字体预加载失败:', error);
        }
    }

    /**
     * 加载单个字体
     */
    async loadFont(fontName, fontUrl) {
        if (this.loadedFonts.has(fontName)) {
            return;
        }

        if (this.fontPromises.has(fontName)) {
            return this.fontPromises.get(fontName);
        }

        const promise = new Promise(async (resolve, reject) => {
            try {
                // 使用 FontFace API 加载字体
                const fontFace = new FontFace(fontName, `url(${fontUrl})`);
                const loadedFont = await fontFace.load();
                document.fonts.add(loadedFont);
                
                this.loadedFonts.add(fontName);
                console.log(`字体 ${fontName} 加载成功`);
                resolve(loadedFont);
            } catch (error) {
                console.warn(`字体 ${fontName} 加载失败:`, error);
                reject(error);
            } finally {
                this.fontPromises.delete(fontName);
            }
        });

        this.fontPromises.set(fontName, promise);
        return promise;
    }

    /**
     * 添加自定义字体映射
     */
    addFontMapping(fontName, fontUrl) {
        this.fontMap.set(fontName, fontUrl);
    }

    /**
     * 移除字体映射
     */
    removeFontMapping(fontName) {
        this.fontMap.delete(fontName);
    }

    /**
     * 获取已加载的字体列表
     */
    getLoadedFonts() {
        return Array.from(this.loadedFonts);
    }

    /**
     * 检查字体是否已加载
     */
    isFontLoaded(fontName) {
        return this.loadedFonts.has(fontName);
    }

    /**
     * 获取字体状态
     */
    getFontStatus() {
        return {
            total: this.fontMap.size,
            loaded: this.loadedFonts.size,
            loading: this.fontPromises.size,
            missing: this.fontMap.size - this.loadedFonts.size - this.fontPromises.size
        };
    }

    /**
     * 强制重新加载字体
     */
    async reloadFont(fontName) {
        this.loadedFonts.delete(fontName);
        this.fontPromises.delete(fontName);
        
        const fontUrl = this.fontMap.get(fontName);
        if (fontUrl) {
            return await this.loadFont(fontName, fontUrl);
        }
    }

    /**
     * 清理字体缓存
     */
    clearFontCache() {
        this.loadedFonts.clear();
        this.fontPromises.clear();
    }
}

// 创建全局实例
window.PDFFontFix = new PDFFontFix();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFFontFix;
}