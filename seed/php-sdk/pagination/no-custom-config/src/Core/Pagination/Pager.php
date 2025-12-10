<?php

namespace Seed\Core\Pagination;

use Generator;
use IteratorAggregate;

/**
 * A collection of values that may take multiple service requests to
 * iterate over.
 *
 * @template TItem
 * @implements IteratorAggregate<int, TItem>
 */
abstract class Pager implements IteratorAggregate
{
    /**
     * Enumerate the values a Page at a time. This may
     * make multiple service requests.
     *
     * @return Generator<int, Page<TItem>>
     */
    abstract public function getPages(): Generator;

    /**
     * Enumerate the values one at a time. This may make multiple service requests.
     *
     * @return Generator<int, TItem>
     */
    public function getIterator(): Generator
    {
        foreach ($this->getPages() as $page) {
            yield from $page->getItems();
        }
    }
}
