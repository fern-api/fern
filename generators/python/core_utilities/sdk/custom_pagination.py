"""
Custom Pagination Support

This file is designed to be modified by SDK users to implement their own
pagination logic. The generator will import SyncCustomPager and AsyncCustomPager
from this module when custom pagination is used.

Users should:
1. Implement their custom pager (e.g., PayrocPager, MyCustomPager, etc.)
2. Create adapter classes (SyncCustomPager/AsyncCustomPager) that bridge
   between the generated SDK code and their custom pager implementation
"""

from __future__ import annotations

from typing import Any, AsyncIterator, Generic, Iterator, TypeVar

# Import the base utilities you'll need
# Adjust these imports based on your actual structure
try:
    from .client_wrapper import AsyncClientWrapper, SyncClientWrapper
except ImportError:
    # Fallback for type hints
    AsyncClientWrapper = Any  # type: ignore
    SyncClientWrapper = Any  # type: ignore

TItem = TypeVar("TItem")
TResponse = TypeVar("TResponse")


class SyncCustomPager(Generic[TItem, TResponse]):
    """
    Adapter for custom synchronous pagination.

    The generator will call this with:
        SyncCustomPager(initial_response=response, client_wrapper=client_wrapper)

    Implement this class to extract pagination metadata from your response
    and delegate to your custom pager implementation.

    Example implementation:

        class SyncCustomPager(Generic[TItem, TResponse]):
            def __init__(
                self,
                *,
                initial_response: TResponse,
                client_wrapper: SyncClientWrapper,
            ):
                # Extract data and pagination metadata from response
                data = initial_response.data  # Adjust based on your response structure
                links = initial_response.links

                # Initialize your custom pager
                self._pager = MyCustomPager(
                    current_page=Page(data),
                    httpx_client=client_wrapper.httpx_client,
                    get_headers=client_wrapper.get_headers,
                    # ... other parameters
                )

            def __iter__(self):
                return iter(self._pager)

            # Delegate other methods to your pager...
    """

    def __init__(
        self,
        *,
        initial_response: TResponse,
        client_wrapper: SyncClientWrapper,
    ):
        """
        Initialize the custom pager.

        Args:
            initial_response: The parsed API response from the first request
            client_wrapper: The client wrapper providing HTTP client and utilities
        """
        raise NotImplementedError(
            "SyncCustomPager must be implemented. "
            "Please implement this class in core/custom_pagination.py to define your pagination logic. "
            "See the class docstring for examples."
        )

    def __iter__(self) -> Iterator[TItem]:
        """Iterate through all items across all pages."""
        raise NotImplementedError("Must implement __iter__ method")


class AsyncCustomPager(Generic[TItem, TResponse]):
    """
    Adapter for custom asynchronous pagination.

    The generator will call this with:
        AsyncCustomPager(initial_response=response, client_wrapper=client_wrapper)

    Implement this class to extract pagination metadata from your response
    and delegate to your custom async pager implementation.

    Example implementation:

        class AsyncCustomPager(Generic[TItem, TResponse]):
            def __init__(
                self,
                *,
                initial_response: TResponse,
                client_wrapper: AsyncClientWrapper,
            ):
                # Extract data and pagination metadata from response
                data = initial_response.data  # Adjust based on your response structure
                links = initial_response.links

                # Initialize your custom async pager
                self._pager = MyAsyncCustomPager(
                    current_page=Page(data),
                    httpx_client=client_wrapper.httpx_client,
                    get_headers=client_wrapper.get_headers,
                    # ... other parameters
                )

            async def __aiter__(self):
                return self._pager.__aiter__()

            # Delegate other methods to your pager...
    """

    def __init__(
        self,
        *,
        initial_response: TResponse,
        client_wrapper: AsyncClientWrapper,
    ):
        """
        Initialize the custom async pager.

        Args:
            initial_response: The parsed API response from the first request
            client_wrapper: The client wrapper providing HTTP client and utilities
        """
        raise NotImplementedError(
            "AsyncCustomPager must be implemented. "
            "Please implement this class in core/custom_pagination.py to define your pagination logic. "
            "See the class docstring for examples."
        )

    async def __aiter__(self) -> AsyncIterator[TItem]:
        """Asynchronously iterate through all items across all pages."""
        raise NotImplementedError("Must implement __aiter__ method")
