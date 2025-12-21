<?php

namespace Seed\Core\Pagination;

use Generator;
use IteratorAggregate;

/**
 * A single Page of items from a request that may return
 * zero or more Pages of items.
 *
 * @template TItem
 * @implements IteratorAggregate<int, TItem>
 */
class Page implements IteratorAggregate
{
    /**
     * @var array<TItem>
     */
    private array $items;

    /**
     * @param array<TItem> $items
     */
    public function __construct(array $items)
    {
        $this->items = $items;
    }

    /**
     * Gets the items in this Page.
     *
     * @return array<TItem>
     */
    public function getItems(): array
    {
        return $this->items;
    }

    /**
     * Get items in this Page as an iterator.
     *
     * @return Generator<int, TItem>
     */
    public function getIterator(): Generator
    {
        return yield from $this->getItems();
    }
}
