# 程序化卷轴开闭组件

这是一个与现有 PWA 解耦的测试组件。直接用静态服务器打开 `index.html` 即可测试。

演示页复用了 `art/签文背景1.png` 的中央竹简区域作为纸面材质，并将
`art/closed-scroll-plain.png` 裁切为左右卷轴头纹理。后者是从原卷轴素材派生的
无花纹透明底版本。两张图只负责材质，
开合仍由各独立层程序化完成，没有缩放整张成品卷轴图。

## 组件结构

- `paper-mask > paper`：固定尺寸纸面，由外层遮罩改变可见宽度。
- `roll.left`：左卷轴头，跟随纸面左边缘移动。
- `roll.right`：右卷轴头，跟随纸面右边缘移动。
- `lighting`：独立的边缘阴影与移动高光层。

左右卷轴头采用平直圆柱裁切，不使用尖头端帽。开合时两侧纹理与柱面高光
沿相反方向循环位移，用同一个 `progress` 表现卷轴旋转。

## 接入

```html
<programmatic-scroll id="scroll" progress="0.5">
  <span slot="title">标题</span>
  <span slot="body">正文</span>
</programmatic-scroll>
<script type="module" src="./programmatic-scroll.js"></script>
```

```js
document.querySelector('#scroll').progress = 0.8;
```

`progress` 会自动限制在 `0...1`。可调样式参数：

- `--scroll-height`
- `--scroll-max-width`
- `--scroll-closed-width`
- `--scroll-paper-color`
- `--scroll-ink-color`
- `--scroll-rod-color`
- `--scroll-gold-color`
- `--scroll-paper-image`
- `--scroll-roll-image`

组件还暴露了 `paper-mask`、`paper`、`content`、`lighting`、`left-roll`、`right-roll` 六个 `part`，接入 PWA 后可用 `::part()` 继续定制。
