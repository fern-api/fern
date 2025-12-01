<?php

namespace Seed\Tests\Core\Pagination\IntOffsetPagerTest;

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

class IntOffsetPagerTest extends TestCase
{
    public function testOffsetPagerWithPage(): void
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

        return new OffsetPager(
            new Request(new Pagination(1)),
            function (Request $request) use ($responses) {
                $response = $responses->current();
                $responses->next();
                return $response;
            },
            fn(Request $request) => $request->pagination?->page ?? 0,
            function (Request $request, int $offset) {
                if ($request->pagination === null) {
                    $request->pagination = new Pagination(0);
                }
                $request->pagination->page = $offset;
            },
            null,
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
        $pages = iterator_to_array($pager->getPages());
        $pageCounter = count($pages);
        $itemCounter = array_reduce($pages, fn($carry, $page) => $carry + count($page->getItems()), 0);

        $this->assertEquals(3, $pageCounter);
        $this->assertEquals(3, $itemCounter);
    }
}