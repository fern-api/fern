<?php

namespace Seed\InlineUsers\InlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\InlineUsers\InlineUsers\Types\WithCursor;
use Seed\Core\Json\JsonProperty;

class ListUsersBodyCursorPaginationRequest extends JsonSerializableType
{
    /**
     * The object that contains the cursor used for pagination
     * in order to fetch the next page of results.
     *
     * @var ?WithCursor $pagination
     */
    #[JsonProperty('pagination')]
    public ?WithCursor $pagination;

    /**
     * @param array{
     *   pagination?: ?WithCursor,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->pagination = $values['pagination'] ?? null;
    }
}
