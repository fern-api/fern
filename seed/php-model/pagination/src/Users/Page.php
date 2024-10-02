<?php

namespace Seed\Users;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Page extends SerializableType
{
    /**
     * @var int $page The current page
     */
    #[JsonProperty('page')]
    public int $page;

    /**
     * @var ?NextPage $next
     */
    #[JsonProperty('next')]
    public ?NextPage $next;

    /**
     * @var int $perPage
     */
    #[JsonProperty('per_page')]
    public int $perPage;

    /**
     * @var int $totalPage
     */
    #[JsonProperty('total_page')]
    public int $totalPage;

    /**
     * @param array{
     *   page: int,
     *   next?: ?NextPage,
     *   perPage: int,
     *   totalPage: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->page = $values['page'];
        $this->next = $values['next'] ?? null;
        $this->perPage = $values['perPage'];
        $this->totalPage = $values['totalPage'];
    }
}
