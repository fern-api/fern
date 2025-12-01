<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsersRequest extends JsonSerializableType
{
    /**
     * @var ?int $page Page index of the results to return. First page is 0.
     */
    public ?int $page;

    /**
     * @var ?int $perPage Number of results per page.
     */
    public ?int $perPage;

    /**
     * @var ?bool $includeTotals Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
     */
    public ?bool $includeTotals;

    /**
     * @var ?string $sort Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
     */
    public ?string $sort;

    /**
     * @var ?string $connection Connection filter
     */
    public ?string $connection;

    /**
     * @var ?string $q Query string following Lucene query string syntax
     */
    public ?string $q;

    /**
     * @var ?string $searchEngine Search engine version (v1, v2, or v3)
     */
    public ?string $searchEngine;

    /**
     * @var ?string $fields Comma-separated list of fields to include or exclude
     */
    public ?string $fields;

    /**
     * @param array{
     *   page?: ?int,
     *   perPage?: ?int,
     *   includeTotals?: ?bool,
     *   sort?: ?string,
     *   connection?: ?string,
     *   q?: ?string,
     *   searchEngine?: ?string,
     *   fields?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->page = $values['page'] ?? null;$this->perPage = $values['perPage'] ?? null;$this->includeTotals = $values['includeTotals'] ?? null;$this->sort = $values['sort'] ?? null;$this->connection = $values['connection'] ?? null;$this->q = $values['q'] ?? null;$this->searchEngine = $values['searchEngine'] ?? null;$this->fields = $values['fields'] ?? null;
    }
}
