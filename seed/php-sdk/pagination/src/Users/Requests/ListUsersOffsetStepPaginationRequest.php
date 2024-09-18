<?php

namespace Seed\Users\Requests;

use Seed\Users\Types\Order;

class ListUsersOffsetStepPaginationRequest
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

}
