<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Users\Types\User;
use Seed\Users\Types\Page;

class ListUsersPaginationResponse extends SerializableType
{
    #[JsonProperty("total_count")]
    /**
     * @var int $totalCount The totall number of /users
     */
    public int $totalCount;

    #[JsonProperty("data"), ArrayType([User])]
    /**
     * @var array<User> $data
     */
    public array $data;

    #[JsonProperty("hasNextPage")]
    /**
     * @var ?bool $hasNextPage
     */
    public ?bool $hasNextPage;

    #[JsonProperty("page")]
    /**
     * @var ?Page $page
     */
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
