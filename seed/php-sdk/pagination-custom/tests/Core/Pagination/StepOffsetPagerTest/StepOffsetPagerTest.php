<?php

namespace Seed\Tests\Core\Pagination\StepOffsetPagerTest;

use ArrayIterator;
use PHPUnit\Framework\TestCase;
use Seed\Core\Pagination\OffsetPager;
use Seed\Core\Pagination\Pager;

class Request
{
    public ?Pagination $pagination;

    public function __construct(?Pagination $pagination)
    {
        $this->pagination = $pagination;
    }
}

class Pagination
{
    public int $itemOffset;
    public int $pageSize;

    public function __construct(int $itemOffset, int $pageSize)
    {
        $this->itemOffset = $itemOffset;
        $this->pageSize = $pageSize;
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

class StepOffsetPagerTest extends TestCase
{
    private Pagination $paginationCopy;

    public function testOffsetPagerWithStep(): void
    {
        $pager = $this->createPager();
        $this->assertPager($pager);
    }

    /**
     * @return OffsetPager<Request, Response, string>
     */
    private function createPager(): OffsetPager
    {
        $responses = new ArrayIterator([
            new Response(new Data(['item1', 'item2'])),
            new Response(new Data(['item3'])),
            new Response(new Data([])),
        ]);

        $this->paginationCopy = new Pagination(0, 2);

        return new OffsetPager(
            new Request($this->paginationCopy),
            function (Request $request) use ($responses) {
                $response = $responses->current();
                $responses->next();
                return $response;
            },
            fn(Request $request) => $request->pagination?->itemOffset ?? 0,
            function (Request $request, int $offset) {
                if ($request->pagination === null) {
                    $request->pagination = new Pagination(0, 2);
                }
                $request->pagination->itemOffset = $offset;
                $this->paginationCopy = $request->pagination;
            },
            fn(Request $request) => $request->pagination?->pageSize,
            fn(Response $response) => $response->data->items,
            null
        );
    }

    /**
     * @param Pager<string> $pager
     * @return void
     */
    private function assertPager(Pager $pager): void
    {
        $pages = $pager->getPages();

        // first page
        $page = $pages->current();
        $this->assertCount(2, $page->getItems());
        $this->assertEquals(0, $this->paginationCopy->itemOffset);

        // second page
        $pages->next();
        $page = $pages->current();
        $this->assertCount(1, $page->getItems());
        $this->assertEquals(2, $this->paginationCopy->itemOffset);

        // third page
        $pages->next();
        $page = $pages->current();
        $this->assertCount(0, $page->getItems());
        $this->assertEquals(3, $this->paginationCopy->itemOffset);

        // no more pages
        $pages->next();
        $this->assertNull($pages->current());
    }
}