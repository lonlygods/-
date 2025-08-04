#!/usr/bin/env node

/**
 * 字体下载脚本
 * 下载开源中文字体文件
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 字体下载配置
const fontConfigs = [
    {
        name: 'Source Han Sans CN',
        url: 'https://github.com/adobe-fonts/source-han-sans/releases/download/2.004R/SourceHanSansCN.zip',
        filename: 'SourceHanSansCN.zip',
        description: '思源黑体 - Adobe 开源中文字体'
    },
    {
        name: 'Source Han Serif CN',
        url: 'https://github.com/adobe-fonts/source-han-serif/releases/download/2.001R/SourceHanSerifCN.zip',
        filename: 'SourceHanSerifCN.zip',
        description: '思源宋体 - Adobe 开源中文字体'
    },
    {
        name: 'WenQuanYi Micro Hei',
        url: 'http://wenq.org/wqy2/index.cgi?Download',
        filename: 'wqy-microhei.ttc',
        description: '文泉驿微米黑 - 开源中文字体'
    }
];

// 创建字体目录
function createFontsDirectory() {
    const fontsDir = path.join(__dirname, '..', 'fonts');
    if (!fs.existsSync(fontsDir)) {
        fs.mkdirSync(fontsDir, { recursive: true });
        console.log('创建字体目录:', fontsDir);
    }
    return fontsDir;
}

// 下载文件
function downloadFile(url, filename, targetPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(targetPath);
        
        const protocol = url.startsWith('https:') ? https : http;
        
        const request = protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    console.log(`✅ 下载完成: ${filename}`);
                    resolve();
                });
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                // 处理重定向
                const newUrl = response.headers.location;
                console.log(`重定向到: ${newUrl}`);
                downloadFile(newUrl, filename, targetPath).then(resolve).catch(reject);
            } else {
                reject(new Error(`下载失败: ${response.statusCode}`));
            }
        });
        
        request.on('error', (err) => {
            fs.unlink(targetPath, () => {}); // 删除不完整的文件
            reject(err);
        });
        
        file.on('error', (err) => {
            fs.unlink(targetPath, () => {});
            reject(err);
        });
    });
}

// 解压 ZIP 文件
function extractZip(zipPath, extractPath) {
    return new Promise((resolve, reject) => {
        const extract = require('extract-zip');
        
        extract(zipPath, { dir: extractPath })
            .then(() => {
                console.log(`✅ 解压完成: ${path.basename(zipPath)}`);
                resolve();
            })
            .catch(reject);
    });
}

// 复制字体文件
function copyFontFiles(sourceDir, targetDir) {
    const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    
    function findFontFiles(dir) {
        const files = [];
        
        function scan(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(item).toLowerCase();
                    if (fontExtensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        }
        
        scan(dir);
        return files;
    }
    
    const fontFiles = findFontFiles(sourceDir);
    
    for (const fontFile of fontFiles) {
        const filename = path.basename(fontFile);
        const targetPath = path.join(targetDir, filename);
        
        fs.copyFileSync(fontFile, targetPath);
        console.log(`📁 复制字体文件: ${filename}`);
    }
    
    return fontFiles.length;
}

// 主函数
async function main() {
    console.log('🚀 开始下载开源中文字体...\n');
    
    const fontsDir = createFontsDirectory();
    const tempDir = path.join(__dirname, '..', 'temp');
    
    // 创建临时目录
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    try {
        for (const config of fontConfigs) {
            console.log(`📥 下载 ${config.name}...`);
            console.log(`   描述: ${config.description}`);
            
            const downloadPath = path.join(tempDir, config.filename);
            
            try {
                await downloadFile(config.url, config.filename, downloadPath);
                
                // 如果是 ZIP 文件，解压并复制字体文件
                if (config.filename.endsWith('.zip')) {
                    const extractPath = path.join(tempDir, path.basename(config.filename, '.zip'));
                    await extractZip(downloadPath, extractPath);
                    
                    const fontCount = copyFontFiles(extractPath, fontsDir);
                    console.log(`   找到 ${fontCount} 个字体文件\n`);
                } else {
                    // 直接复制字体文件
                    const targetPath = path.join(fontsDir, config.filename);
                    fs.copyFileSync(downloadPath, targetPath);
                    console.log(`   复制字体文件: ${config.filename}\n`);
                }
                
            } catch (error) {
                console.log(`❌ 下载失败: ${config.name} - ${error.message}\n`);
            }
        }
        
        console.log('✅ 字体下载完成！');
        console.log(`字体文件保存在: ${fontsDir}`);
        
        // 清理临时文件
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log('🧹 清理临时文件完成');
        }
        
    } catch (error) {
        console.error('❌ 下载过程中出现错误:', error.message);
        process.exit(1);
    }
}

// 检查是否直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, downloadFile, extractZip };