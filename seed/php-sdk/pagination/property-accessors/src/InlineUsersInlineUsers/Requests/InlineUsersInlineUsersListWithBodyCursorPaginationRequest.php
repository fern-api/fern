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
    private ?InlineUsersWithCursor $pagination;

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

    /**
     * @return ?InlineUsersWithCursor
     */
    public function getPagination(): ?InlineUsersWithCursor
    {
        return $this->pagination;
    }

    /**
     * @param ?InlineUsersWithCursor $value
     */
    public function setPagination(?InlineUsersWithCursor $value = null): self
    {
        $this->pagination = $value;
        $this->_setField('pagination');
        return $this;
    }
}
