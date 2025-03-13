<?php

namespace Seed\Tests\Core\Pagination\GeneratorPagerTest;

use ArrayIterator;
use Generator;
use PHPUnit\Framework\TestCase;
use Seed\Core\Pagination\Pager;
use Seed\Core\Pagination\Page;

class Pagination
{
    public int $page;

    public function __construct(int $page)
    {
        $this->page = $page;
    }
}

class Response
{
    public Data $data;

    public function __construct(Data $data)
    {
        $this->data = $data;
    }
}

class Data
{
    /**
     * @var string[]
     */
    public array $items;

    /**
     * @param string[] $items
     */
    public function __construct(array $items)
    {
        $this->items = $items;
    }
}

class GeneratorPagerTest extends TestCase
{
    public function testPagerItemsIteration(): void
    {
        $pager = $this->createPager();
        $this->assertPagerItems($pager);
    }

    public function testPagerPagesIteration(): void
    {
        $pager = $this->createPager();
        $this->assertPagerPages($pager);
    }

    /**
     * @return Pager<string>
     */
    private function createPager(): Pager
    {
        $responses = new ArrayIterator([
            new Response(new Data(['item1', 'item2'])),
            new Response(new Data(['item3'])),
            new Response(new Data([])),
        ]);

        return new class ($responses) extends Pager {
            /**
             * @var ArrayIterator<int, Response>
             */
            private ArrayIterator $responses;

            /**
             * @param ArrayIterator<int, Response> $responses
             */
            public function __construct(ArrayIterator $responses)
            {
                $this->responses = $responses;
            }

            /**
             * @return Generator<Page<string>>
             */
            public function getPages(): Generator
            {
                while ($this->responses->valid()) {
                    $response = $this->responses->current();
                    $this->responses->next();
                    yield new Page($response->data->items);
                }
            }
        };
    }

    /**
     * @param Pager<string> $pager
     * @return void
     */
    private function assertPagerItems(Pager $pager): void
    {
        $items = [];
        foreach ($pager as $item) {
            $items[] = $item;
        }
        $this->assertCount(3, $items);
        $this->assertEquals(['item1', 'item2', 'item3'], $items);
    }

    /**
     * @param Pager<string> $pager
     * @return void
     */
    private function assertPagerPages(Pager $pager): void
    {
        $pages = [];
        foreach ($pager->getPages() as $page) {
            $pages[] = $page;
        }
        $pageCounter = count($pages);
        $itemCounter = array_reduce($pages, fn ($carry, $page) => $carry + count($page->getItems()), 0);

        $this->assertEquals(3, $pageCounter);
        $this->assertEquals(3, $itemCounter);
    }
}
