<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListResourcesRequest extends JsonSerializableType
{
    /**
     * @var int $page Zero-indexed page number
     */
    public int $page;

    /**
     * @var int $perPage Number of items per page
     */
    public int $perPage;

    /**
     * @var string $sort Sort field
     */
    public string $sort;

    /**
     * @var string $order Sort order (asc or desc)
     */
    public string $order;

    /**
     * @var bool $includeTotals Whether to include total count
     */
    public bool $includeTotals;

    /**
     * @var ?string $fields Comma-separated list of fields to include
     */
    public ?string $fields;

    /**
     * @var ?string $search Search query
     */
    public ?string $search;

    /**
     * @param array{
     *   page: int,
     *   perPage: int,
     *   sort: string,
     *   order: string,
     *   includeTotals: bool,
     *   fields?: ?string,
     *   search?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->page = $values['page'];$this->perPage = $values['perPage'];$this->sort = $values['sort'];$this->order = $values['order'];$this->includeTotals = $values['includeTotals'];$this->fields = $values['fields'] ?? null;$this->search = $values['search'] ?? null;
    }
}
