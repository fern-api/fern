<?php

namespace Seed\Core\Pagination;

use Generator;

/**
 * @template TRequest
 * @template TResponse
 * @template TItem
 * @template TCursor
 * @extends Pager<TItem>
 * @internal Use the Pager class
 */
class CursorPager extends Pager
{
    /** @var TRequest */
    private $request;

    /** @var callable(TRequest): TResponse */
    private $getNextPage;

    /** @var callable(TRequest, TCursor): void */
    private $setCursor;

    /** @var callable(TResponse): ?TCursor */
    private $getNextCursor;

    /** @var callable(TResponse): ?array<TItem> */
    private $getItems;

    /**
     * @param TRequest $request
     * @param callable(TRequest): TResponse $getNextPage
     * @param callable(TRequest, TCursor): void $setCursor
     * @param callable(TResponse): ?TCursor $getNextCursor
     * @param callable(TResponse): ?array<TItem> $getItems
     */
    public function __construct(
        $request,
        callable $getNextPage,
        callable $setCursor,
        callable $getNextCursor,
        callable $getItems
    ) {
        $this->request = clone $request;
        $this->getNextPage = $getNextPage;
        $this->setCursor = $setCursor;
        $this->getNextCursor = $getNextCursor;
        $this->getItems = $getItems;
    }

    /**
     * @return Generator<int, Page<TItem>>
     */
    public function getPages(): Generator
    {
        do {
            $response = ($this->getNextPage)($this->request);
            $items = ($this->getItems)($response);
            $nextCursor = ($this->getNextCursor)($response);
            if ($items !== null) {
                yield new Page($items);
            }

            if ($nextCursor === null || $nextCursor === '') {
                break;
            }

            ($this->setCursor)($this->request, $nextCursor);
        } while (true);
    }
}
