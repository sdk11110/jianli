# 普洱照片统一手绘记录

用户提供的两张饭桌、一张古树、一张牛群山路照片，采用与大理组相同的水粉和油画棒质感。保留主要构图与真实主体；色彩统一为森林绿、青蓝、奶油白、赭黄。AI 生成内容为固定图片素材，网页没有实时生成接口。

交付：`assets/photos/painted/puer-{feast,lunch,tree,cows}.png` 为母版，`.webp` 为网页图片。牛群替换原 `photo-04`，避免重复计入相册。共 14 张照片，7 张为本次两轮统一手绘照片。

## 原片对照

`assets/photos/source/` 保存用于滑动对照的大理彩虹、普洱古树、普洱饭桌。均为用户原片的 WebP 副本。原始文件保持不变。

## 完整生成提示词

### puer-feast

输入：D:/Users/20810414/Documents/xwechat_files/wxid_8v64ut3eiabj22_5995/temp/RWTemp/2026-09/e2e7dcafc131b0f00d83f5321d293c52/d08527a8c09064c42839aba1506252ab.jpg

```text
Use case: style-transfer. Edit FIRST reference travel photograph into a polished hand-painted gouache and oil pastel travel illustration matching SECOND reference painting style. Same cohesive Yunnan personal travel journal family as the second image: deep jade teal, moss olive, warm cream, amber and small apricot accents; tactile fine dry-brush pigment on matte paper, softly simplified natural forms, layered irregular hand-painted shapes, sophisticated nostalgic storybook editorial art. Keep original photograph subject, composition, camera perspective and all key objects recognizable. Only take brushwork and color approach from SECOND reference, NOT its scene. Genuinely repaint rather than applying a photo filter. Portrait 3:4 aspect ratio, edge-to-edge artwork, NO border, NO text, NO lettering, NO signatures, NO logos, NO watermark. Keep the wooden dining table seen from above at an angle: huge oval platter of orange sauce with fish and shredded vegetables in center foreground, golden round omelette above, bowl of meat and greens at right, green vegetables below, ceramic jug at top right. Preserve authentic meal and arrangement; no invented dishes.
```

### puer-lunch

输入：D:/Users/20810414/Documents/xwechat_files/wxid_8v64ut3eiabj22_5995/temp/RWTemp/2026-09/e2e7dcafc131b0f00d83f5321d293c52/5418a51fac3c1d2273fdac685d3e0178.jpg

```text
Use case: style-transfer. Edit FIRST reference travel photograph into a polished hand-painted gouache and oil pastel travel illustration matching SECOND reference painting style. Same cohesive Yunnan personal travel journal family as the second image: deep jade teal, moss olive, warm cream, amber and small apricot accents; tactile fine dry-brush pigment on matte paper, softly simplified natural forms, layered irregular hand-painted shapes, sophisticated nostalgic storybook editorial art. Keep original photograph subject, composition, camera perspective and all key objects recognizable. Only take brushwork and color approach from SECOND reference, NOT its scene. Genuinely repaint rather than applying a photo filter. Portrait 3:4 aspect ratio, edge-to-edge artwork, NO border, NO text, NO lettering, NO signatures, NO logos, NO watermark. Keep the quiet home-style meal on wooden table: foreground stainless steel rice bowl with large white rice paddle, yellow potato strips at left, plate of mushrooms with small red chilies at top, large pale green gourd soup with ladle at right. Preserve each dish arrangement and perspective.
```

### puer-tree

输入：C:/Users/20810414/AppData/Local/Temp/codex-clipboard-342b40a6-2e7c-497f-a4dd-2cefb354bdeb.jpg

```text
Use case: style-transfer. Edit FIRST reference travel photograph into a polished hand-painted gouache and oil pastel travel illustration matching SECOND reference painting style. Same cohesive Yunnan personal travel journal family as the second image: deep jade teal, moss olive, warm cream, amber and small apricot accents; tactile fine dry-brush pigment on matte paper, softly simplified natural forms, layered irregular hand-painted shapes, sophisticated nostalgic storybook editorial art. Keep original photograph subject, composition, camera perspective and all key objects recognizable. Only take brushwork and color approach from SECOND reference, NOT its scene. Genuinely repaint rather than applying a photo filter. Portrait 3:4 aspect ratio, edge-to-edge artwork, NO border, NO text, NO lettering, NO signatures, NO logos, NO watermark. Keep the enormous old tree at right rising into dense leafy canopy, thick climbing plants, twisted aerial roots forming arch over a small road at bottom, pale blue sky openings, modest streetlamps at lower left. Keep recognizable branching structure and arch. Remove all readable sign text, render signs as simple colored marks.
```

### puer-cows

输入：C:/Users/20810414/AppData/Local/Temp/codex-clipboard-68a2daa8-7711-4638-94e8-fda889aa643f.jpg

```text
Use case: style-transfer. Edit FIRST reference travel photograph into a polished hand-painted gouache and oil pastel travel illustration matching SECOND reference painting style. Same cohesive Yunnan personal travel journal family as the second image: deep jade teal, moss olive, warm cream, amber and small apricot accents; tactile fine dry-brush pigment on matte paper, softly simplified natural forms, layered irregular hand-painted shapes, sophisticated nostalgic storybook editorial art. Keep original photograph subject, composition, camera perspective and all key objects recognizable. Only take brushwork and color approach from SECOND reference, NOT its scene. Genuinely repaint rather than applying a photo filter. Portrait 3:4 aspect ratio, edge-to-edge artwork, NO border, NO text, NO lettering, NO signatures, NO logos, NO watermark. Keep the cobblestone mountain road receding upward into forest, herd of small brown and gray cows calmly blocking the road, silver SUV waiting just behind cows slightly right of center, green canopy all around. Keep the cow and car positions and scale. License plate should be a plain muted blue plate without readable letters/numbers.
```

