<?php

namespace Seed\InlineUsers\InlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\InlineUsers\InlineUsers\Types\WithPage;
use Seed\Core\Json\JsonProperty;

class ListUsersBodyOffsetPaginationRequest extends JsonSerializableType
{
    /**
     * The object that contains the offset used for pagination
     * in order to fetch the next page of results.
     *
     * @var ?WithPage $pagination
     */
    #[JsonProperty('pagination')]
    public ?WithPage $pagination;

    /**
     * @param array{
     *   pagination?: ?WithPage,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->pagination = $values['pagination'] ?? null;
    }
}
