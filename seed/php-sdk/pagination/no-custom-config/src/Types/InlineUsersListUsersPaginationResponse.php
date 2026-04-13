<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineUsersListUsersPaginationResponse extends JsonSerializableType
{
    /**
     * @var ?bool $hasNextPage
     */
    #[JsonProperty('hasNextPage')]
    public ?bool $hasNextPage;

    /**
     * @var ?InlineUsersPage $page
     */
    #[JsonProperty('page')]
    public ?InlineUsersPage $page;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @var InlineUsersUsers $data
     */
    #[JsonProperty('data')]
    public InlineUsersUsers $data;

    /**
     * @param array{
     *   totalCount: int,
     *   data: InlineUsersUsers,
     *   hasNextPage?: ?bool,
     *   page?: ?InlineUsersPage,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->hasNextPage = $values['hasNextPage'] ?? null;
        $this->page = $values['page'] ?? null;
        $this->totalCount = $values['totalCount'];
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
