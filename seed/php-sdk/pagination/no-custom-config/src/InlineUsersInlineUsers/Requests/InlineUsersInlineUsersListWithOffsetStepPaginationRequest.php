<?php

namespace Seed\InlineUsersInlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\InlineUsersOrder;

class InlineUsersInlineUsersListWithOffsetStepPaginationRequest extends JsonSerializableType
{
    /**
     * @var ?int $page Defaults to first page
     */
    public ?int $page;

    /**
     * The maximum number of elements to return.
     * This is also used as the step size in this
     * paginated endpoint.
     *
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @var ?value-of<InlineUsersOrder> $order
     */
    public ?string $order;

    /**
     * @param array{
     *   page?: ?int,
     *   limit?: ?int,
     *   order?: ?value-of<InlineUsersOrder>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->page = $values['page'] ?? null;
        $this->limit = $values['limit'] ?? null;
        $this->order = $values['order'] ?? null;
    }
}
