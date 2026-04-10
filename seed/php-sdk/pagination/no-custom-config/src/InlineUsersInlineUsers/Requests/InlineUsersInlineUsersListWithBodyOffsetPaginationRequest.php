<?php

namespace Seed\InlineUsersInlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\InlineUsersWithPage;
use Seed\Core\Json\JsonProperty;

class InlineUsersInlineUsersListWithBodyOffsetPaginationRequest extends JsonSerializableType
{
    /**
     * The object that contains the offset used for pagination
     * in order to fetch the next page of results.
     *
     * @var ?InlineUsersWithPage $pagination
     */
    #[JsonProperty('pagination')]
    public ?InlineUsersWithPage $pagination;

    /**
     * @param array{
     *   pagination?: ?InlineUsersWithPage,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->pagination = $values['pagination'] ?? null;
    }
}
