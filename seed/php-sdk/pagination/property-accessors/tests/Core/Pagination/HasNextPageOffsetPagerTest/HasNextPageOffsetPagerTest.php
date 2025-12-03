<?php

namespace Seed\Tests\Core\Pagination\HasNextPageOffsetPagerTest;

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
    public int $page;

    public function __construct(int $page)
    {
        $this->page = $page;
    }
}

class Response
{
    public Data $data;
    public bool $hasNext;

    public function __construct(Data $data, bool $hasNext)
    {
        $this->data = $data;
        $this->hasNext = $hasNext;
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

class HasNextPageOffsetPagerTest extends TestCase
{
    public function testOffsetPagerWithHasNextPage(): void
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
            new Response(new Data(['item1', 'item2']), true),
            new Response(new Data(['item3', 'item4']), true),
            new Response(new Data(['item5']), false),
        ]);

        return new OffsetPager(
            new Request(new Pagination(1)),
            function (Request $request) use ($responses) {
                $response = $responses->current();
                $responses->next();
                return $response;
            },
            fn(Request $request) => $request->pagination?->page ?? 0,
            function (Request $request, int $offset) {
                if($request->pagination === null) {
                    $request->pagination = new Pagination(0);
                }
                $request->pagination->page = $offset;
            },
            null,
            fn(Response $response) => $response->data->items,
            fn(Response $response) => $response->hasNext
        );
    }

    /**
     * @param Pager<string> $pager
     * @return void
     */
    private function assertPager(Pager $pager): void
    {
        $pages = iterator_to_array($pager->getPages());
        $pageCounter = count($pages);
        $itemCounter = array_reduce($pages, fn($carry, $page) => $carry + count($page->getItems()), 0);

        $this->assertEquals(3, $pageCounter);
        $this->assertEquals(5, $itemCounter);
    }
}