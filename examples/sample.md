# 徽 · 示例文档

**徽 (Hui)** 是 Markdown 多主题导出工具：支持 **PNG / PDF / HTML**。

## 功能亮点

- 8 套精选主题，与 Web 版 md2png 一致
- 一键 CLI 转换，适合脚本与 CI
- GFM：表格、任务列表、代码高亮

## 代码

```ts
import { convertToFormats } from 'hui'

await convertToFormats(
  { markdown: '# Hello', themeId: 'notion' },
  ['png', 'pdf'],
  (fmt) => `out/hello.${fmt}`,
)
```

## 表格

| 主题 | 风格 | 适用场景 |
|------|------|----------|
| github-light | 经典文档 | README、技术文档 |
| notion | 柔和笔记 | 会议纪要、知识库 |
| terminal | 终端绿字 | 命令备忘、黑客风 |

## 引用

> 输出即产品。Chrome 只是为了帮你尽快拿到一份好看的文件。

## 列表

1. 写好 Markdown
2. 选主题：`hui themes`
3. 导出：`hui convert note.md -t academic -f png,pdf`

- [x] HTML 导出
- [x] PNG 导出
- [x] PDF 导出
- [ ] 自定义主题文件（后续）

---

`inline code` · **加粗** · *斜体* · [链接](https://example.com)
