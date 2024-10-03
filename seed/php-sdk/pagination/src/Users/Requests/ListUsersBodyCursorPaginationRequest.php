<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Users\Types\WithCursor;
use Seed\Core\Json\JsonProperty;

class ListUsersBodyCursorPaginationRequest extends JsonSerializableType
{
    /**
     * @var ?WithCursor $pagination The object that contains the cursor used for pagination
    in order to fetch the next page of results.

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
    ) {
        $this->pagination = $values['pagination'] ?? null;
    }
}
