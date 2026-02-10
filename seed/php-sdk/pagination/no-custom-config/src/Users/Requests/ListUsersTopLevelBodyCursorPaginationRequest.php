<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ListUsersTopLevelBodyCursorPaginationRequest extends JsonSerializableType
{
    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     *
     * @var ?string $cursor
     */
    #[JsonProperty('cursor')]
    public ?string $cursor;

    /**
     * @var ?string $filter An optional filter to apply to the results.
     */
    #[JsonProperty('filter')]
    public ?string $filter;

    /**
     * @param array{
     *   cursor?: ?string,
     *   filter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->cursor = $values['cursor'] ?? null;
        $this->filter = $values['filter'] ?? null;
    }
}
