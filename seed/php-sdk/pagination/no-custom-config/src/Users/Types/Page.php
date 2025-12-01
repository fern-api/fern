<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Page extends JsonSerializableType
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
     *   perPage: int,
     *   totalPage: int,
     *   next?: ?NextPage,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->page = $values['page'];$this->next = $values['next'] ?? null;$this->perPage = $values['perPage'];$this->totalPage = $values['totalPage'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
