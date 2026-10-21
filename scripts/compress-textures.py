"""Re-encodes downloaded textures for the web as WebP: albedo <=1024px, normals <=512px."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / "public" / "textures"
for img_path in [p for p in root.glob("*/*.jpg") if p.parent.name != "foliage"]:
    is_normal = img_path.stem == "nor"
    limit, quality = (512, 90) if is_normal else (1024, 80)
    with Image.open(img_path) as im:
        im = im.convert("RGB")
        if max(im.size) > limit:
            im = im.resize((limit, limit), Image.LANCZOS)
        im.save(img_path.with_suffix(".webp"), "WEBP", quality=quality, method=6)
        if not is_normal:
            # lighter tier for phones and low-memory devices
            im.resize((512, 512), Image.LANCZOS).save(img_path.with_name("diff-512.webp"), "WEBP", quality=78, method=6)
    img_path.unlink()

sky = root.parent / "hdri" / "sky_4k.jpg"
if sky.exists():
    with Image.open(sky) as im:
        if im.size[0] > 4096:
            im.convert("RGB").resize((4096, 2048), Image.LANCZOS).save(sky, "JPEG", quality=80, optimize=True, progressive=True)

# Foliage atlas: albedo + alpha mask -> RGBA WebP (full and phone tiers)
src = root / "foliage" / "src"
if (src / "leaves_diff.jpg").exists():
    with Image.open(src / "leaves_diff.jpg") as d, Image.open(src / "leaves_alpha.jpg") as a:
        rgba = d.convert("RGB")
        rgba.putalpha(a.convert("L"))
        rgba.save(root / "foliage" / "leaf-atlas.webp", "WEBP", quality=85, method=6)
        rgba.resize((512, 512), Image.LANCZOS).save(root / "foliage" / "leaf-atlas-512.webp", "WEBP", quality=82, method=6)
    for f in src.iterdir():
        f.unlink()
    src.rmdir()
