# 字体文件目录

此目录用于存放 PDF.js 所需的字体文件。

## 常用中文字体

请将以下字体文件放置在此目录中：

### 基础字体
- `simsun.ttf` - 宋体
- `simhei.ttf` - 黑体
- `msyh.ttf` - 微软雅黑
- `kaiti.ttf` - 楷体
- `fangsong.ttf` - 仿宋

### 华文字体
- `stsong.ttf` - 华文宋体
- `stzhongsong.ttf` - 华文中宋
- `stkaiti.ttf` - 华文楷体
- `stfangsong.ttf` - 华文仿宋
- `stliti.ttf` - 华文隶书
- `stxingkai.ttf` - 华文行楷
- `sthupo.ttf` - 华文琥珀
- `stxihei.ttf` - 华文细黑

## 字体来源

您可以从以下位置获取字体文件：

1. **Windows 系统字体目录**：
   - `C:\Windows\Fonts\`

2. **在线字体下载**：
   - 思源字体：https://github.com/adobe-fonts/source-han-sans
   - 文泉驿字体：http://wenq.org/wqy2/index.cgi?Download

3. **开源字体**：
   - 思源黑体
   - 思源宋体
   - 文泉驿字体

## 注意事项

1. 确保字体文件格式为 TTF、OTF 或 WOFF
2. 字体文件名要与代码中的映射一致
3. 注意字体版权问题，建议使用开源字体
4. 字体文件较大，建议进行压缩优化

## 字体压缩

可以使用以下工具压缩字体文件：

```bash
# 使用 fonttools 压缩
pip install fonttools
ttf2woff2 input.ttf output.woff2
```

## 字体子集化

为了减小文件大小，可以只包含需要的字符：

```bash
# 使用 fonttools 创建子集
pyftsubset input.ttf --text="需要的文字内容" --output-file=output.ttf
```