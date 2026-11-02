// tests/content-shape.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const code = fs.readFileSync(path.join(root, "js/content.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(code, sandbox);
const C = sandbox.window.TravelContent;

const PHOTO_CITIES = {
  "puer-feast": "puer",
  "puer-lunch": "puer",
  "puer-tree": "puer",
  "dali-rainbow": "dali",
  "dali-cableway": "dali",
  "dali-sunset": "dali",
  "photo-01": "banna",
  "photo-02": "dali",
  "photo-03": "dali",
  "photo-04": "puer",
  "photo-05": "gallery",
  "photo-07": "banna",
  "clear-water": "dali",
  "fruit-table": "banna",
  "snow-roof": "dali",
};

const PHOTO_CAPTIONS = {
  "puer-feast": "热乎的一桌，就是好日子",
  "puer-lunch": "再盛一碗，慢慢吃",
  "puer-tree": "树把日子撑得很慢",
  "dali-rainbow": "彩虹落在水杉之间",
  "dali-cableway": "坐进一整片绿色里",
  "dali-sunset": "把日落留在洱海",
  "photo-01": "今天的快乐是美食给的",
  "photo-02": "白墙、粉花、私人小泳池",
  "photo-03": "雪山下，湖水先亮起来",
  "photo-04": "山路把车让给牛",
  "photo-05": "拼贴里的一天",
  "photo-07": "碧水上的小白船",
  "clear-water": "树影下面，水是通透的",
  "fruit-table": "木桌上的慢时光",
  "snow-roof": "金顶之上，是一整座雪山",
};

const CHAPTER_PHOTO_IDS = {
  banna: ["photo-01", "photo-07", "fruit-table"],
  puer: ["photo-04", "puer-tree", "puer-feast", "puer-lunch"],
  dali: ["dali-rainbow", "dali-cableway", "dali-sunset", "photo-02", "photo-03", "clear-water", "snow-roof"],
};

assert.ok(C, "TravelContent missing");

for (const key of ["site", "chapters", "photos", "playlist", "faq", "outro", "about"]) {
  assert.ok(key in C, `missing top-level key: ${key}`);
}

assert.ok(C.site.tagline, "site.tagline required for competition pitch");
assert.ok(C.about.letter.length >= 2, "about.letter should explain the product");
assert.ok(C.faq.some((f) => /作品|手帐|做什么/.test(f.q)), "FAQ should explain product purpose");

assert.equal(C.chapters.length, 3);
assert.deepEqual([...C.chapters.map((c) => c.id)], ["banna", "puer", "dali"]);

for (const chapter of C.chapters) {
  const expectedIds = CHAPTER_PHOTO_IDS[chapter.id];
  assert.ok(expectedIds, `unexpected chapter id: ${chapter.id}`);
  assert.deepEqual([...chapter.photoIds], expectedIds);
}

assert.equal(C.photos.length, Object.keys(PHOTO_CITIES).length);
assert.equal(new Set(C.photos.map((p) => p.id)).size, C.photos.length, "photo IDs must be unique");
for (const p of C.photos) {
  assert.ok(fs.existsSync(path.join(root, p.src)), `missing ${p.src}`);
  assert.ok(p.caption && p.note);
  if (p.painted) assert.ok(fs.existsSync(path.join(root, p.original)), `missing master ${p.original}`);
  assert.equal(p.city, PHOTO_CITIES[p.id], `${p.id} city mismatch`);
  assert.equal(p.caption, PHOTO_CAPTIONS[p.id], `${p.id} caption mismatch`);
}

assert.ok(Array.isArray(C.playlist));
assert.ok(C.playlist.every((t) => "src" in t));

const track = C.playlist[0];
assert.equal(track.id, "track-1");
assert.equal(track.title, "待放入 · 旅途侧 A");
assert.equal(track.artist, "稍后添曲");
assert.equal(track.src, null);

assert.ok(C.faq.length >= 3);
console.log("content-shape OK");
