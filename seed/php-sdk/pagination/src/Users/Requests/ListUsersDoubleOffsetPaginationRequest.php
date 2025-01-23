<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Users\Types\Order;

class ListUsersDoubleOffsetPaginationRequest extends JsonSerializableType
{
    /**
     * @var ?float $page Defaults to first page
     */
    public ?float $page;

    /**
     * @var ?float $perPage Defaults to per page
     */
    public ?float $perPage;

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
     *   page?: ?float,
     *   perPage?: ?float,
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
