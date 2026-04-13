<?php

namespace Seed\InlineUsersInlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\InlineUsersOrder;

class InlineUsersInlineUsersListWithCursorPaginationRequest extends JsonSerializableType
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
     *   page?: ?int,
     *   perPage?: ?int,
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
