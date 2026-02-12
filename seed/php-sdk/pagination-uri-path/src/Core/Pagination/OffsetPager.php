<?php

namespace Seed\Core\Pagination;

use Generator;

/**
 * @template TRequest
 * @template TResponse
 * @template TItem
 * @extends Pager<TItem>
 * @internal Use the Pager class
 */
class OffsetPager extends Pager
{
    /** @var TRequest */
    private $request;

    /** @var callable(TRequest): TResponse */
    private $getNextPage;

    /** @var callable(TRequest): int */
    private $getOffset;

    /** @var callable(TRequest, int): void */
    private $setOffset;

    /** @var ?callable(TRequest): ?int */
    private $getStep;

    /** @var callable(TResponse): ?array<TItem> */
    private $getItems;

    /** @var ?callable(TResponse): ?bool */
    private $hasNextPage;

    /**
     * @param TRequest $request
     * @param callable(TRequest): TResponse $getNextPage
     * @param callable(TRequest): int $getOffset
     * @param callable(TRequest, int): void $setOffset
     * @param ?callable(TRequest): ?int $getStep
     * @param callable(TResponse): ?array<TItem> $getItems
     * @param ?callable(TResponse): ?bool $hasNextPage
     */
    public function __construct(
        $request,
        callable $getNextPage,
        callable $getOffset,
        callable $setOffset,
        ?callable $getStep,
        callable $getItems,
        ?callable $hasNextPage
    ) {
        $this->request = clone $request;
        $this->getNextPage = $getNextPage;
        $this->getOffset = $getOffset;
        $this->setOffset = $setOffset;
        $this->getStep = $getStep;
        $this->getItems = $getItems;
        $this->hasNextPage = $hasNextPage;
    }

    /**
     * @return Generator<int, Page<TItem>>
     */
    public function getPages(): Generator
    {
        $hasStep = $this->getStep !== null && ($this->getStep)($this->request) !== null;
        $offset = ($this->getOffset)($this->request);
        do {
            $response = ($this->getNextPage)($this->request);
            $items = ($this->getItems)($response);
            $itemCount = $items !== null ? count($items) : 0;
            $hasNextPage = $this->hasNextPage !== null ? ($this->hasNextPage)($response) : $itemCount > 0;
            if ($items !== null) {
                yield new Page($items);
            }

            if ($hasStep) {
                $offset += $items !== null ? count($items) : 1;
            } else {
                $offset++;
            }

            ($this->setOffset)($this->request, $offset);
        } while ($hasNextPage);
    }
}
