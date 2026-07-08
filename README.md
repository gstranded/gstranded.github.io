# 高海圳个人主页 GitHub Pages 模板

这是一个纯静态个人主页模板，可以直接用于 GitHub Pages。

## 文件说明

- `index.html`：主页结构和所有内容占位。
- `styles.css`：页面样式和响应式布局。
- `script.js`：移动端导航和当前栏目高亮。
- `content-form.md`：你需要补充给我的信息清单。
- `assets/`：头像、照片、简历 PDF 等公开文件。
- `remaining-info.md`：根据当前简历整理出的待补充信息。
- `.nojekyll`：让 GitHub Pages 按纯静态站点发布。

## 本地预览

直接双击打开 `index.html` 即可预览。

也可以在这个目录启动一个简单本地服务：

```bash
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

## 放到 GitHub Pages

最简单的方式：

1. 新建仓库：`你的GitHub用户名.github.io`
2. 把这些文件放到仓库根目录。
3. 推送到 GitHub。
4. 打开 `https://你的GitHub用户名.github.io`

如果使用普通仓库，也可以在仓库的 `Settings -> Pages` 中选择部署分支。

## 下一步

把 `remaining-info.md` 里的信息继续补全后，我可以继续帮你替换论文链接、博客入口、证书链接，或者加独立博客页面和中英双语版本。
