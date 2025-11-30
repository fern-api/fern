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
    private ?WithCursor $pagination;

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

    /**
     * @return ?WithCursor
     */
    public function getPagination(): ?WithCursor {
        return $this->pagination;}

    /**
     * @param ?WithCursor $value
     */
    public function setPagination(?WithCursor $value = null): self {
        $this->pagination = $value;return $this;}
}
