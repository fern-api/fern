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
     * @param array{
     *   page?: ?int,
     *   limit?: ?int,
     *   order?: ?Order,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->page = $values['page'] ?? null;
        $this->limit = $values['limit'] ?? null;
        $this->order = $values['order'] ?? null;
    }
}
