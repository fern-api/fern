<?php

namespace Seed\InlineUsersInlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\InlineUsersOrder;

class InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest extends JsonSerializableType
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
     * @var ?value-of<InlineUsersOrder> $order
     */
    public ?string $order;

    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     *
     * @var ?string $startingAfter
     */
    public ?string $startingAfter;

    /**
     * @param array{
     *   page?: ?float,
     *   perPage?: ?float,
     *   order?: ?value-of<InlineUsersOrder>,
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
