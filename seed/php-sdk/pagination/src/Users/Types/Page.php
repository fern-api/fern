<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Users\Types\NextPage;

class Page extends SerializableType
{
    #[JsonProperty("page")]
    /**
     * @var int $page The current page
     */
    public int $page;

    #[JsonProperty("per_page")]
    /**
     * @var int $perPage
     */
    public int $perPage;

    #[JsonProperty("total_page")]
    /**
     * @var int $totalPage
     */
    public int $totalPage;

    #[JsonProperty("next")]
    /**
     * @var ?NextPage $next
     */
    public ?NextPage $next;

    /**
     * @param int $page The current page
     * @param int $perPage
     * @param int $totalPage
     * @param ?NextPage $next
     */
    public function __construct(
        int $page,
        int $perPage,
        int $totalPage,
        ?NextPage $next = null,
    ) {
        $this->page = $page;
        $this->perPage = $perPage;
        $this->totalPage = $totalPage;
        $this->next = $next;
    }
}
