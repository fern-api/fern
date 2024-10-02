<?php

namespace Seed\Users\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ListUsersPaginationResponse extends SerializableType
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
     * @var array<User> $data
     */
    #[JsonProperty('data'), ArrayType([User::class])]
    public array $data;

    /**
     * @param array{
     *   hasNextPage?: ?bool,
     *   page?: ?Page,
     *   totalCount: int,
     *   data: array<User>,
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
}
