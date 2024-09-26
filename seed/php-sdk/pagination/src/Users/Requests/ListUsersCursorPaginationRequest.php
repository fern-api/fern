<?php

namespace Seed\Users\Requests;

use Seed\Core\SerializableType;
use Seed\Users\Types\Order;

class ListUsersCursorPaginationRequest extends SerializableType
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
     * @var ?value-of<Order> $order
     */
    public ?string $order;

    /**
     * @var ?string $startingAfter The cursor used for pagination in order to fetch
    the next page of results.
     */
    public ?string $startingAfter;

    /**
     * @param array{
     *   page?: ?int,
     *   perPage?: ?int,
     *   order?: ?value-of<Order>,
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->page = $values['page'] ?? null;
        $this->perPage = $values['perPage'] ?? null;
        $this->order = $values['order'] ?? null;
        $this->startingAfter = $values['startingAfter'] ?? null;
    }
}
