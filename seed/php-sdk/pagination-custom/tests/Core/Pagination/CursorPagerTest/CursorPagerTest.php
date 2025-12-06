<?php

namespace Seed\Tests\Core\Pagination\CursorPagerTest;

use ArrayIterator;
use Generator;
use PHPUnit\Framework\TestCase;
use Seed\Core\Pagination\CursorPager;
use Seed\Core\Pagination\Pager;
use Seed\Core\Pagination\Page;

class Request
{
    public ?string $cursor;

    /**
     * @param ?string $cursor
     */
    public function __construct(?string $cursor)
    {
        $this->cursor = $cursor;
    }
}

class Response
{
    /**
     * @var ?array<string>
     */
    public ?array $items;

    public ?ResponseCursor $next;

    /**
     * @param ?array<string> $items
     * @param ?ResponseCursor $next
     */
    public function __construct(?array $items, ?ResponseCursor $next)
    {
        $this->items = $items;
        $this->next = $next;
    }
}

class ResponseCursor
{
    public ?string $cursor;

    /**
     * @param ?string $cursor
     */
    public function __construct(?string $cursor)
    {
        $this->cursor = $cursor;
    }
}

class CursorPagerTest extends TestCase
{
    private const CURSOR1 = null;
    private const CURSOR2 = '00000000-0000-0000-0000-000000000001';
    private const CURSOR3 = '00000000-0000-0000-0000-000000000002';
    private ?string $cursorCopy;

    public function testCursorPager(): void
    {
        $pager = $this->createPager();
        $this->assertPager($pager);
    }

    /**
     * @return CursorPager<Request, Response, string, string>
     */
    private function createPager(): CursorPager
    {
        $request = new Request(self::CURSOR1);
        $responses = new ArrayIterator([
            new Response(['item1', 'item2'], new ResponseCursor(self::CURSOR2)),
            new Response(['item1'], new ResponseCursor(self::CURSOR3)),
            new Response([], null),
        ]);

        $this->cursorCopy = self::CURSOR1;

        return new CursorPager(
            $request,
            function (Request $request) use ($responses) {
                $response = $responses->current();
                $responses->next();
                return $response;
            },
            function (Request $request, ?string $cursor) {
                $request->cursor = $cursor;
                $this->cursorCopy = $cursor;
            },
            fn(Response $response) => $response->next->cursor ?? null,
            fn(Response $response) => $response->items ?? []
        );
    }

    /**
     * @param Pager<string> $pager
     * @return void
     */
    private function assertPager(Pager $pager): void
    {
        /** @var Generator<int, Page<string>> $pages */
        $pages = $pager->getPages();

        // first page
        /** @var Page<string> $page */
        $page = $pages->current();
        $this->assertCount(2, $page->getItems());
        $this->assertEquals(self::CURSOR1, $this->cursorCopy);

        // second page
        $pages->next();
        $page = $pages->current();
        $this->assertCount(1, $page->getItems());
        $this->assertEquals(self::CURSOR2, $this->cursorCopy);

        // third page
        $pages->next();
        $page = $pages->current();
        $this->assertCount(0, $page->getItems());
        $this->assertEquals(self::CURSOR3, $this->cursorCopy);

        // no more pages
        $pages->next();
        $this->assertNull($pages->current());
    }
}