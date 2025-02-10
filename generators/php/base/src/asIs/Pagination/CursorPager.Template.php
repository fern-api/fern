<?php

namespace <%= namespace%>;

use Generator;

/**
 * @template TRequest
 * @template TRequestOptions
 * @template TResponse
 * @template TItem
 * @extends Pager<TItem>
 * @internal Use the Pager class
 */
class CursorPager extends Pager
{
    /** @var TRequest */
    private $request;

    /** @var ?TRequestOptions */
    private $options;

    /** @var callable(TRequest, ?TRequestOptions): TResponse */
    private $getNextPage;

    /** @var callable(TRequest, string): void */
    private $setCursor;

    /** @var callable(TResponse): ?string */
    private $getNextCursor;

    /** @var callable(TResponse): ?array<TItem> */
    private $getItems;

    /**
     * @param TRequest $request
     * @param ?TRequestOptions $options
     * @param callable(TRequest, ?TRequestOptions): TResponse $getNextPage
     * @param callable(TRequest, string): void $setCursor
     * @param callable(TResponse): ?string $getNextCursor
     * @param callable(TResponse): ?array<TItem> $getItems
     */
    public function __construct(
        $request,
        $options,
        callable $getNextPage,
        callable $setCursor,
        callable $getNextCursor,
        callable $getItems
    ) {
        $this->request = clone $request;
        $this->options = $options !== null ? clone $options : null;
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
            $response = ($this->getNextPage)($this->request, $this->options);
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