<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsersAliasedDataRequest extends JsonSerializableType
{
    /**
     * @var ?int $page Defaults to first page
     */
    public ?int $page;

    /**
     * @var ?int $perPage Defaults to per page
     */
    public ?int $perPage;

    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     *
     * @var ?string $startingAfter
     */
    public ?string $startingAfter;

    /**
     * @param array{
     *   page?: ?int,
     *   perPage?: ?int,
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->page = $values['page'] ?? null;
        $this->perPage = $values['perPage'] ?? null;
        $this->startingAfter = $values['startingAfter'] ?? null;
    }
}
