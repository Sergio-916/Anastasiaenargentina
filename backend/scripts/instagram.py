import asyncio
import argparse
import json
from datetime import date, timedelta
from pathlib import Path

import httpx
from playwright.async_api import async_playwright

_script_dir = Path(__file__).parent
_output_dir = _script_dir.parent / "data" / "instagram_cards"
_manifest_path = _output_dir / "cards.json"

LOCAL_SITE_URL = "http://localhost:3000"
LOCAL_API_URL = "http://127.0.0.1:8000"
PROD_SITE_URL = "https://anastasiashimuk.com"
PROD_API_URL = "https://anastasiashimuk.com"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create Instagram event card screenshots.",
    )
    parser.add_argument(
        "--production",
        action="store_true",
        help="Use production site/API instead of local development URLs.",
    )
    return parser.parse_args()


def get_base_urls(production: bool):
    if production:
        return PROD_SITE_URL, PROD_API_URL
    return LOCAL_SITE_URL, LOCAL_API_URL


async def fetch_active_short_term_events(api_url: str):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(f"{api_url}/api/v1/events/", params={"limit": 1000})
        response.raise_for_status()

    events = response.json().get("data", [])
    week_start = get_instagram_week_start().isoformat()
    return [
        event
        for event in events
        if event.get("slug")
        and not event.get("is_long_term")
        and (event.get("end_date") or event.get("start_date")) >= week_start
    ]


def get_instagram_week_start():
    today = date.today()
    if today.weekday() == 6:
        return today + timedelta(days=1)
    return today - timedelta(days=today.weekday())


async def wait_for_images(page):
    await page.wait_for_function(
        "() => Array.from(document.images).every((img) => img.complete)",
    )


async def save_card(page, site_url: str, slug: str, order: int):
    image_path = _output_dir / f"{order}-{slug}.png"

    await page.goto(
        f"{site_url}/events/instagram/{slug}",
        wait_until="networkidle",
    )
    await wait_for_images(page)

    await page.screenshot(
        path=image_path,
        full_page=False,
    )
    return image_path.name


async def save_title_card(page, site_url: str):
    image_path = _output_dir / "0-title.png"

    await page.goto(f"{site_url}/events/instagram/title", wait_until="networkidle")
    await wait_for_images(page)

    await page.screenshot(
        path=image_path,
        full_page=False,
    )
    return image_path.name


async def main():
    args = parse_args()
    site_url, api_url = get_base_urls(args.production)
    _output_dir.mkdir(parents=True, exist_ok=True)

    events = await fetch_active_short_term_events(api_url)
    if not events:
        print("No active events found.")
        return

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": 1080, "height": 1350},
            device_scale_factor=1,
        )

        title_image_name = await save_title_card(page, site_url)
        print(f"Saved {_output_dir / title_image_name}")

        cards = {}
        for order, event in enumerate(events, start=1):
            slug = event["slug"]
            image_name = await save_card(page, site_url, slug, order)
            cards[slug] = {
                "order": order,
                "title": event["title"],
                "official_url": event.get("official_url"),
            }
            print(f"Saved {_output_dir / image_name}")

        await browser.close()

    _manifest_path.write_text(
        json.dumps(cards, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Saved {_manifest_path}")


if __name__ == "__main__":
    asyncio.run(main())
