<?php

namespace Seed\InlineUsersInlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\InlineUsersWithCursor;
use Seed\Core\Json\JsonProperty;

class InlineUsersInlineUsersListWithBodyCursorPaginationRequest extends JsonSerializableType
{
    /**
     * The object that contains the cursor used for pagination
     * in order to fetch the next page of results.
     *
     * @var ?InlineUsersWithCursor $pagination
     */
    #[JsonProperty('pagination')]
    public ?InlineUsersWithCursor $pagination;

    /**
     * @param array{
     *   pagination?: ?InlineUsersWithCursor,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->pagination = $values['pagination'] ?? null;
    }
}
