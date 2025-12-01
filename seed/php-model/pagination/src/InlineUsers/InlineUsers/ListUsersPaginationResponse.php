<?php

namespace Seed\InlineUsers\InlineUsers;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ListUsersPaginationResponse extends JsonSerializableType
{
    /**
     * @var ?bool $hasNextPage
     */
    #[JsonProperty('hasNextPage')]
    public ?bool $hasNextPage;

    /**
     * @var ?Page $page
     */
    #[JsonProperty('page')]
    public ?Page $page;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @var Users $data
     */
    #[JsonProperty('data')]
    public Users $data;

    /**
     * @param array{
     *   totalCount: int,
     *   data: Users,
     *   hasNextPage?: ?bool,
     *   page?: ?Page,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->hasNextPage = $values['hasNextPage'] ?? null;$this->page = $values['page'] ?? null;$this->totalCount = $values['totalCount'];$this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
