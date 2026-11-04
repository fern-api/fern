from typing import List, Optional

from core_utilities.sdk.pagination import AsyncPager, SyncPager


def _sync_pages(pages: List[List[int]], calls: List[int], index: int = 0) -> SyncPager[int, None]:
    # Mirrors the generated cursor pagers: `get_next` is set even on the last page.
    calls.append(index)
    has_next = index + 1 < len(pages)
    return SyncPager(
        has_next=has_next,
        items=pages[index],
        get_next=lambda: _sync_pages(pages, calls, index + 1 if has_next else 0),
        response=None,
    )


async def _async_pages(pages: List[List[int]], calls: List[int], index: int = 0) -> AsyncPager[int, None]:
    calls.append(index)
    has_next = index + 1 < len(pages)

    async def get_next() -> AsyncPager[int, None]:
        return await _async_pages(pages, calls, index + 1 if has_next else 0)

    return AsyncPager(has_next=has_next, items=pages[index], get_next=get_next, response=None)


def test_sync_next_page_stops_on_last_page() -> None:
    calls: List[int] = []
    page: Optional[SyncPager[int, None]] = _sync_pages([[1, 2], [3]], calls)
    items: List[int] = []
    # Bounded so the old behaviour (refetching the first page) fails instead of hanging.
    for _ in range(5):
        if page is None:
            break
        items.extend(page.items or [])
        page = page.next_page()
    assert items == [1, 2, 3]
    assert calls == [0, 1]


async def test_async_next_page_stops_on_last_page() -> None:
    calls: List[int] = []
    page: Optional[AsyncPager[int, None]] = await _async_pages([[1, 2], [3]], calls)
    items: List[int] = []
    # Bounded so the old behaviour (refetching the first page) fails instead of hanging.
    for _ in range(5):
        if page is None:
            break
        items.extend(page.items or [])
        page = await page.next_page()
    assert items == [1, 2, 3]
    assert calls == [0, 1]
