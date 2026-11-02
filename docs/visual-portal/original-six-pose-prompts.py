# -*- coding: utf-8 -*-
"""Generate high-res home-guide character poses from reference sheet, then matte."""
from __future__ import annotations

import asyncio
import io
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.backend.config import Settings, validate_live_configuration
from app.backend.db import get_session_factory
from app.backend.providers.birefnet import BiRefNetMatter
from app.backend.providers.image2 import Image2Client
from app.backend.services.generations import create_generation

REF = PROJECT_ROOT / "data" / "uploads" / "home-guide-v2" / "character-ref.png"
OUT_RAW = PROJECT_ROOT / "data" / "uploads" / "home-guide-v2" / "raw"
OUT_CUT = Path(r"F:\工作记录\2026\九\intorduce\home\assets\character\generated")
SIZE = "1536x2048"  # 2K · 3:4 portrait
QUALITY = "high"
CONCURRENCY = 3
OPERATOR = "邵笛珂-20810414"

IDENTITY = (
    "Use the reference image only to preserve the same female character identity and illustration language. "
    "Create a new original 3D anime editorial character: short tousled dark-brown bob, crescent hair clip, "
    "warm amber-brown eyes, small beauty mark, expressive friendly face, orange knitted scarf, cobalt-blue shirt, "
    "brown pleated skirt, leather satchel, silver headphones around the neck, orange notebook and black pen. "
    "Do not reproduce the reference sheet layout, handwritten annotations, color swatches, or any text. "
    "Single full-body character, centered, transparent-ready clean background, no text, no watermark, "
    "soft warm studio lighting, refined high-end character illustration, consistent face and outfit across poses."
)


@dataclass
class Job:
    key: str
    prompt: str


JOBS = [
    Job(
        "wave",
        IDENTITY
        + " Pose: confident small wave with the left hand, bright knowing smile, notebook tucked under the right arm, "
        "one foot turned outward, relaxed editorial greeting.",
    ),
    Job(
        "laptop",
        IDENTITY
        + " Pose: presenting a glowing portfolio card on an open palm, other hand holding the orange notebook, "
        "clear confident smile, shoulders open toward the viewer.",
    ),
    Job(
        "think",
        IDENTITY
        + " Pose: thoughtful half-smile with pen touching her chin, gaze angled upward, satchel hanging at the hip, "
        "subtle curious expression, elegant S-curve stance.",
    ),
    Job(
        "tip",
        IDENTITY
        + " Pose: playful raised eyebrow and lifted index finger, scarf trailing slightly as if she just had an idea, "
        "pen in the other hand, crisp readable silhouette.",
    ),
    Job(
        "present",
        IDENTITY
        + " Pose: turning slightly to show a small glowing portfolio thumbnail beside her, open palm gesture, "
        "headphones visible on the neck, calm proud smile.",
    ),
    Job(
        "compare",
        IDENTITY
        + " Pose: travel moment with a small coffee cup in one hand and a folded map in the other, "
        "soft afternoon smile, scarf and hair moving gently, warm relaxed silhouette.",
    ),
]


def normalize_cutout(cut: Image.Image, *, canvas=(1100, 1400)) -> Image.Image:
    cut = cut.convert("RGBA")
    bbox = cut.getbbox()
    if bbox:
        pad = 28
        cut = cut.crop(
            (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(cut.width, bbox[2] + pad),
                min(cut.height, bbox[3] + pad),
            )
        )
    cw, ch = canvas
    scale = min(cw / cut.width, ch / cut.height) * 0.92
    nw = max(1, int(cut.width * scale))
    nh = max(1, int(cut.height * scale))
    cut = cut.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas_img = Image.new("RGBA", canvas, (0, 0, 0, 0))
    canvas_img.paste(cut, ((cw - nw) // 2, ch - nh - 20), cut)
    return canvas_img


async def run_one(job: Job, *, sem, session_factory, provider, settings, matter, results):
    async with sem:
        stamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{stamp}] START {job.key}", flush=True)
        try:
            with session_factory() as session:
                generation = await create_generation(
                    session,
                    provider,
                    settings.data_dir,
                    prompt=job.prompt,
                    quality=QUALITY,
                    size=SIZE,
                    source_images=[REF],
                    source_image_paths=[REF.name],
                    source_image_labels=["角色参考三视图"],
                    mode="edit",
                    operator=OPERATOR,
                )
            if generation.status != "succeeded" or not generation.image_path:
                raise RuntimeError(generation.error or "generation failed")
            src = Path(settings.data_dir) / generation.image_path
            raw_path = OUT_RAW / f"{job.key}.png"
            await asyncio.to_thread(shutil.copy2, src, raw_path)
            raw_bytes = await asyncio.to_thread(raw_path.read_bytes)
            matted = await asyncio.to_thread(matter.matte, raw_bytes)
            cut = Image.open(io.BytesIO(matted.png_bytes)).convert("RGBA")
            final = normalize_cutout(cut)
            dest = OUT_CUT / f"{job.key}.png"
            await asyncio.to_thread(final.save, dest, optimize=True)
            # also mirror into flat character folder for site default
            mirror = OUT_CUT.parent / f"{job.key}.png"
            await asyncio.to_thread(final.save, mirror, optimize=True)
            results[job.key] = {
                "status": "ok",
                "model": matted.model,
                "raw": str(raw_path),
                "cut": str(dest),
                "ms": generation.duration_ms,
                "matte_ms": matted.duration_ms,
            }
            print(
                f"[{datetime.now().strftime('%H:%M:%S')}] DONE  {job.key} "
                f"gen={generation.duration_ms}ms matte={matted.model}/{matted.duration_ms}ms",
                flush=True,
            )
        except Exception as exc:  # noqa: BLE001
            results[job.key] = {"status": "fail", "error": str(exc)}
            print(f"[{datetime.now().strftime('%H:%M:%S')}] FAIL  {job.key}: {exc}", flush=True)


async def main_async() -> int:
    if not REF.is_file():
        raise SystemExit(f"Missing reference: {REF}")
    OUT_RAW.mkdir(parents=True, exist_ok=True)
    OUT_CUT.mkdir(parents=True, exist_ok=True)

    settings = Settings()
    validate_live_configuration(settings)
    session_factory = get_session_factory(settings.database_url)
    provider = Image2Client(settings)
    matter = BiRefNetMatter(mode="auto", prefer_gpu=True)
    sem = asyncio.Semaphore(CONCURRENCY)
    results: dict[str, dict] = {}
    await asyncio.gather(
        *[
            run_one(
                job,
                sem=sem,
                session_factory=session_factory,
                provider=provider,
                settings=settings,
                matter=matter,
                results=results,
            )
            for job in JOBS
        ]
    )
    failed = [k for k, v in results.items() if v.get("status") != "ok"]
    print("SUMMARY", results, flush=True)
    return 1 if failed else 0


def main() -> int:
    return asyncio.run(main_async())


if __name__ == "__main__":
    raise SystemExit(main())
