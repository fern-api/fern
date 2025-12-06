<?php

namespace Seed\NullableOptional\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsersRequest extends JsonSerializableType
{
    /**
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @var ?int $offset
     */
    public ?int $offset;

    /**
     * @var ?bool $includeDeleted
     */
    public ?bool $includeDeleted;

    /**
     * @var ?string $sortBy
     */
    public ?string $sortBy;

    /**
     * @param array{
     *   limit?: ?int,
     *   offset?: ?int,
     *   includeDeleted?: ?bool,
     *   sortBy?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->limit = $values['limit'] ?? null;$this->offset = $values['offset'] ?? null;$this->includeDeleted = $values['includeDeleted'] ?? null;$this->sortBy = $values['sortBy'] ?? null;
    }
}
