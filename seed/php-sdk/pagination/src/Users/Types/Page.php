<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Page extends SerializableType
{
    /**
     * @var int $page The current page
     */
    #[JsonProperty("page")]
    public int $page;

    /**
     * @var int $perPage
     */
    #[JsonProperty("per_page")]
    public int $perPage;

    /**
     * @var int $totalPage
     */
    #[JsonProperty("total_page")]
    public int $totalPage;

    /**
     * @var ?NextPage $next
     */
    #[JsonProperty("next")]
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
