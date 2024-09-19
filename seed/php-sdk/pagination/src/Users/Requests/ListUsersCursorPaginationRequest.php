<?php

namespace Seed\Users\Requests;

use Seed\Users\Types\Order;

class ListUsersCursorPaginationRequest
{
    /**
     * @var ?int $page Defaults to first page
     */
    public ?int $page;

    /**
     * @var ?int $perPage Defaults to per page
     */
    public ?int $perPage;

    /**
     * @var ?Order $order
     */
    public ?Order $order;

    /**
     * @var ?string $startingAfter The cursor used for pagination in order to fetch
    the next page of results.
     */
    public ?string $startingAfter;

    /**
     * @param ?int $page Defaults to first page
     * @param ?int $perPage Defaults to per page
     * @param ?Order $order
     * @param ?string $startingAfter The cursor used for pagination in order to fetch
    the next page of results.
     */
    public function __construct(
        ?int $page = null,
        ?int $perPage = null,
        ?Order $order = null,
        ?string $startingAfter = null,
    ) {
        $this->page = $page;
        $this->perPage = $perPage;
        $this->order = $order;
        $this->startingAfter = $startingAfter;
    }
}
