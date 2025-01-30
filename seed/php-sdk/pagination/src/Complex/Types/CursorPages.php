<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CursorPages extends JsonSerializableType
{
    /**
     * @var ?StartingAfterPaging $next
     */
    #[JsonProperty('next')]
    public ?StartingAfterPaging $next;

    /**
     * @var ?int $page
     */
    #[JsonProperty('page')]
    public ?int $page;

    /**
     * @var ?int $perPage
     */
    #[JsonProperty('per_page')]
    public ?int $perPage;

    /**
     * @var ?int $totalPages
     */
    #[JsonProperty('total_pages')]
    public ?int $totalPages;

    /**
     * @var string $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   next?: ?StartingAfterPaging,
     *   page?: ?int,
     *   perPage?: ?int,
     *   totalPages?: ?int,
     *   type: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->next = $values['next'] ?? null;
        $this->page = $values['page'] ?? null;
        $this->perPage = $values['perPage'] ?? null;
        $this->totalPages = $values['totalPages'] ?? null;
        $this->type = $values['type'];
    }
}
