#!/usr/bin/env node

/**
 * 测试 PDF 生成脚本
 * 生成包含中文字体的测试 PDF 文件
 */

const fs = require('fs');
const path = require('path');

// 简单的 PDF 内容生成器
class SimplePDFGenerator {
    constructor() {
        this.content = [];
        this.objects = [];
        this.objectCount = 0;
        this.fonts = new Map();
    }

    // 添加对象
    addObject(content) {
        this.objectCount++;
        this.objects.push(`${this.objectCount} 0 obj\n${content}\nendobj\n`);
        return this.objectCount;
    }

    // 添加字体
    addFont(fontName, fontType = 'Type1', encoding = 'WinAnsiEncoding') {
        const fontId = `F${this.fonts.size + 1}`;
        const fontObject = `<<
/Type /Font
/Subtype /${fontType}
/BaseFont /${fontName}
/Encoding /${encoding}
>>`;
        
        const fontRef = this.addObject(fontObject);
        this.fonts.set(fontId, fontRef);
        return fontId;
    }

    // 生成页面内容
    generatePageContent(texts) {
        let content = 'BT\n';
        
        // 添加标题
        content += '/F1 24 Tf\n';
        content += '50 750 Td\n';
        content += '(PDF.js 字体测试文档) Tj\n';
        content += 'ET\n';
        
        // 添加测试文本
        let y = 700;
        for (const text of texts) {
            content += 'BT\n';
            content += '/F1 12 Tf\n';
            content += `50 ${y} Td\n`;
            content += `(${text}) Tj\n`;
            content += 'ET\n';
            y -= 20;
        }
        
        return content;
    }

    // 生成 PDF
    generate(texts = []) {
        // 默认测试文本
        const defaultTexts = [
            '这是宋体文字测试',
            '这是黑体文字测试',
            '这是楷体文字测试',
            '这是仿宋文字测试',
            '这是微软雅黑文字测试',
            'English text test',
            '数字测试: 1234567890',
            '符号测试: !@#$%^&*()',
            '混合测试: 中文English123!@#'
        ];

        const testTexts = texts.length > 0 ? texts : defaultTexts;
        
        // 添加字体
        const font1 = this.addFont('SimSun');
        const font2 = this.addFont('SimHei');
        const font3 = this.addFont('KaiTi');
        const font4 = this.addFont('FangSong');
        const font5 = this.addFont('Microsoft YaHei');

        // 生成页面内容
        const pageContent = this.generatePageContent(testTexts);
        const contentRef = this.addObject(`<<
/Length ${pageContent.length}
>>
stream
${pageContent}
endstream`);

        // 生成页面对象
        const pageObject = `<<
/Type /Page
/Parent 3 0 R
/MediaBox [0 0 595 842]
/Resources <<
/Font <<
/F1 2 0 R
/F2 6 0 R
/F3 7 0 R
/F4 8 0 R
/F5 9 0 R
>>
>>
/Contents ${contentRef} 0 R
>>`;
        
        const pageRef = this.addObject(pageObject);

        // 生成页面树
        const pagesObject = `<<
/Type /Pages
/Kids [${pageRef} 0 R]
/Count 1
>>`;
        
        const pagesRef = this.addObject(pagesObject);

        // 生成目录
        const catalogObject = `<<
/Type /Catalog
/Pages ${pagesRef} 0 R
>>`;
        
        const catalogRef = this.addObject(catalogObject);

        // 生成交叉引用表
        const xref = this.generateXRef();

        // 生成文件尾
        const trailer = `trailer
<<
/Size ${this.objectCount + 1}
/Root ${catalogRef} 0 R
>>
startxref
${xref.offset}
%%EOF`;

        // 组合所有内容
        const pdfContent = `%PDF-1.4
${this.objects.join('\n')}
${xref.content}
${trailer}`;

        return pdfContent;
    }

    // 生成交叉引用表
    generateXRef() {
        let offset = 0;
        let xrefContent = 'xref\n';
        xrefContent += `0 ${this.objectCount + 1}\n`;
        xrefContent += '0000000000 65535 f \n';
        
        for (let i = 1; i <= this.objectCount; i++) {
            const objectOffset = offset.toString().padStart(10, '0');
            xrefContent += `${objectOffset} 00000 n \n`;
            
            // 计算下一个对象的偏移量
            const objectIndex = this.objects.findIndex((obj, index) => index === i - 1);
            if (objectIndex !== -1) {
                offset += this.objects[objectIndex].length + 1; // +1 for newline
            }
        }
        
        return {
            content: xrefContent,
            offset: offset + xrefContent.length + 1
        };
    }
}

// 主函数
function main() {
    console.log('📄 生成测试 PDF 文件...');
    
    const generator = new SimplePDFGenerator();
    const pdfContent = generator.generate();
    
    const outputPath = path.join(__dirname, '..', 'test.pdf');
    fs.writeFileSync(outputPath, pdfContent);
    
    console.log(`✅ 测试 PDF 文件已生成: ${outputPath}`);
    console.log('💡 您可以使用此文件测试 PDF.js 的字体显示效果');
}

// 检查是否直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { SimplePDFGenerator };