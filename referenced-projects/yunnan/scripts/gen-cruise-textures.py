from PIL import Image, ImageDraw, ImageFilter
import random, math, os

out = os.path.join(os.path.dirname(__file__), "..", "assets", "cruise")
os.makedirs(out, exist_ok=True)
rng = random.Random(42)


def noise(img, amp=18, count=8000, size=2):
    d = ImageDraw.Draw(img)
    w, h = img.size
    for _ in range(count):
        x, y = rng.randrange(w), rng.randrange(h)
        c = rng.randint(-amp, amp)
        px = img.getpixel((x, y))
        ncol = tuple(max(0, min(255, ch + c)) for ch in px[:3])
        d.ellipse([x, y, x + size, y + size], fill=ncol)
    return img


# sand
sand = Image.new("RGB", (1024, 1024), (236, 214, 156))
g = ImageDraw.Draw(sand)
for y in range(1024):
    t = y / 1024
    col = (int(242 - 20 * t), int(222 - 28 * t), int(168 - 40 * t))
    g.line([(0, y), (1024, y)], fill=col)
noise(sand, 22, 14000, 2)
for _ in range(220):
    x, y = rng.randrange(1024), rng.randrange(1024)
    g.ellipse(
        [x, y, x + rng.randint(8, 28), y + rng.randint(4, 14)],
        fill=(250, 236, 190),
    )
sand = sand.filter(ImageFilter.GaussianBlur(0.6))
sand.save(os.path.join(out, "sand.png"), optimize=True)

# grass
grass = Image.new("RGB", (1024, 1024), (86, 150, 72))
d = ImageDraw.Draw(grass)
for y in range(1024):
    t = y / 1024
    col = (int(110 - 40 * t), int(175 - 55 * t), int(90 - 35 * t))
    d.line([(0, y), (1024, y)], fill=col)
for _ in range(5000):
    x, y = rng.randrange(1024), rng.randrange(1024)
    d.line(
        [(x, y), (x + rng.randint(-3, 3), y - rng.randint(4, 14))],
        fill=(40 + rng.randint(0, 40), 90 + rng.randint(0, 50), 35 + rng.randint(0, 30)),
    )
for _ in range(400):
    x, y = rng.randrange(1024), rng.randrange(1024)
    d.ellipse(
        [x, y, x + 3, y + 3],
        fill=(210, 90, 120) if rng.random() < 0.4 else (240, 200, 80),
    )
grass = grass.filter(ImageFilter.GaussianBlur(0.4))
grass.save(os.path.join(out, "grass.png"), optimize=True)

# wood
wood = Image.new("RGB", (512, 512), (168, 118, 70))
d = ImageDraw.Draw(wood)
for y in range(512):
    shade = 150 + int(30 * math.sin(y * 0.08)) + rng.randint(-8, 8)
    d.line([(0, y), (512, y)], fill=(shade, int(shade * 0.7), int(shade * 0.42)))
for _ in range(80):
    x = rng.randrange(512)
    d.line([(x, 0), (x + rng.randint(-8, 8), 512)], fill=(120, 80, 45), width=1)
wood = wood.filter(ImageFilter.GaussianBlur(0.5))
wood.save(os.path.join(out, "wood.png"), optimize=True)

# roof tiles
roof = Image.new("RGB", (512, 512), (150, 78, 58))
d = ImageDraw.Draw(roof)
tile_h, tile_w = 28, 40
for row in range(0, 512, tile_h):
    off = (row // tile_h % 2) * (tile_w // 2)
    for col in range(-tile_w, 512, tile_w):
        x = col + off
        base = 130 + rng.randint(-15, 20)
        d.rectangle(
            [x, row, x + tile_w - 2, row + tile_h - 2],
            fill=(base, int(base * 0.48), int(base * 0.36)),
        )
        d.arc([x + 4, row + 2, x + tile_w - 6, row + tile_h - 4], 200, 340, fill=(90, 45, 35))
roof.save(os.path.join(out, "roof.png"), optimize=True)

# rock
rock = Image.new("RGB", (512, 512), (110, 116, 122))
d = ImageDraw.Draw(rock)
for _ in range(900):
    x, y = rng.randrange(512), rng.randrange(512)
    r = rng.randint(4, 22)
    c = 80 + rng.randint(0, 50)
    d.ellipse([x, y, x + r, y + r], fill=(c, c + 4, c + 8))
rock = rock.filter(ImageFilter.GaussianBlur(1.2))
rock.save(os.path.join(out, "rock.png"), optimize=True)

# foam
foam = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
d = ImageDraw.Draw(foam)
for _ in range(40):
    x, y = rng.randrange(128), rng.randrange(128)
    r = rng.randint(3, 14)
    for i in range(r, 0, -1):
        a = int(200 * (i / r) ** 2)
        d.ellipse([x - i, y - i, x + i, y + i], fill=(255, 255, 255, a))
foam.save(os.path.join(out, "foam.png"), optimize=True)

# caustic
cau = Image.new("RGB", (1024, 1024), (20, 90, 110))
d = ImageDraw.Draw(cau)
for _ in range(180):
    x, y = rng.randrange(1024), rng.randrange(1024)
    r = rng.randint(30, 120)
    for i in range(6):
        rr = r - i * 8
        if rr <= 0:
            break
        col = (40 + i * 18, 140 + i * 10, 160 + i * 8)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=col)
cau = cau.filter(ImageFilter.GaussianBlur(2))
cau.save(os.path.join(out, "caustic.png"), optimize=True)

# wall
wall = Image.new("RGB", (512, 512), (244, 239, 228))
noise(wall, 10, 6000, 1)
wall.save(os.path.join(out, "wall.png"), optimize=True)

print("done", sorted(os.listdir(out)))
