<?php

namespace Seed\Users\Requests;

use Seed\Users\Types\Order;

class ListWithOffsetPaginationHasNextPageRequest
{
    /**
     * @var ?int $page Defaults to first page
     */
    public ?int $page;

    /**
     * @var ?int $limit The maxiumum number of elements to return.
    This is also used as the step size in this
    paginated endpoint.
     */
    public ?int $limit;

    /**
     * @var ?Order $order
     */
    public ?Order $order;

    /**
     * @param ?int $page Defaults to first page
     * @param ?int $limit The maxiumum number of elements to return.
    This is also used as the step size in this
    paginated endpoint.
     * @param ?Order $order
     */
    public function __construct(
        ?int $page = null,
        ?int $limit = null,
        ?Order $order = null,
    ) {
        $this->page = $page;
        $this->limit = $limit;
        $this->order = $order;
    }
}
