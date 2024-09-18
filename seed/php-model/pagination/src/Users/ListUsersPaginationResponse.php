<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ListUsersPaginationResponse extends SerializableType
{
    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty("total_count")]
    public int $totalCount;

    /**
     * @var array<User> $data
     */
    #[JsonProperty("data"), ArrayType([User::class])]
    public array $data;

    /**
     * @var ?bool $hasNextPage
     */
    #[JsonProperty("hasNextPage")]
    public ?bool $hasNextPage;

    /**
     * @var ?Page $page
     */
    #[JsonProperty("page")]
    public ?Page $page;

    /**
     * @param int $totalCount The totall number of /users
     * @param array<User> $data
     * @param ?bool $hasNextPage
     * @param ?Page $page
     */
    public function __construct(
        int $totalCount,
        array $data,
        ?bool $hasNextPage = null,
        ?Page $page = null,
    ) {
        $this->totalCount = $totalCount;
        $this->data = $data;
        $this->hasNextPage = $hasNextPage;
        $this->page = $page;
    }
}
