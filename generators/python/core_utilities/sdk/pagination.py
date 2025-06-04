from __future__ import annotations

from dataclasses import dataclass
from typing import AsyncIterator, Awaitable, Callable, Generic, Iterator, List, Optional, TypeVar

from .http_response import BaseHttpResponse

T = TypeVar("T")
"""Generic to represent the underlying type of the results within a page"""


# SDKs implement a Page ABC per-pagination request, the endpoint then returns a pager that wraps this type
# for example, an endpoint will return SyncPager[UserPage] where UserPage implements the Page ABC. ex:
#
# SyncPager<InnerListType>(
#     has_next=response.list_metadata.after is not None,
#     items=response.data,
#     # This should be the outer function that returns the SyncPager again
#     get_next=lambda: list(..., cursor: response.cursor) (or list(..., offset: offset + 1))
# )


@dataclass(frozen=True)
class SyncPager(Generic[T]):
    get_next: Optional[Callable[[], Optional[SyncPager[T]]]]
    has_next: bool
    items: Optional[List[T]]
    response: Optional[BaseHttpResponse]

    # Here we type ignore the iterator to avoid a mypy error
    # caused by the type conflict with Pydanitc's __iter__ method
    # brought in by extending the base model
    def __iter__(self) -> Iterator[T]:  # type: ignore[override]
        for page in self.iter_pages():
            if page.items is not None:
                yield from page.items

    def iter_pages(self) -> Iterator[SyncPager[T]]:
        page: Optional[SyncPager[T]] = self
        while page is not None:
            yield page

            if not page.has_next or page.get_next is None:
                return

            page = page.get_next()
            if page is None or page.items is None or len(page.items) == 0:
                return

    def next_page(self) -> Optional[SyncPager[T]]:
        return self.get_next() if self.get_next is not None else None


@dataclass(frozen=True)
class AsyncPager(Generic[T]):
    get_next: Optional[Callable[[], Awaitable[Optional[AsyncPager[T]]]]]
    has_next: bool
    items: Optional[List[T]]
    response: Optional[BaseHttpResponse]

    async def __aiter__(self) -> AsyncIterator[T]:
        async for page in self.iter_pages():
            if page.items is not None:
                for item in page.items:
                    yield item

    async def iter_pages(self) -> AsyncIterator[AsyncPager[T]]:
        page: Optional[AsyncPager[T]] = self
        while page is not None:
            yield page

            if not page.has_next or page.get_next is None:
                return

            page = await page.get_next()
            if page is None or page.items is None or len(page.items) == 0:
                return

    async def next_page(self) -> Optional[AsyncPager[T]]:
        return await self.get_next() if self.get_next is not None else None
