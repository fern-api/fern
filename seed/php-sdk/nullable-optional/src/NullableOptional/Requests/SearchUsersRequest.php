<?php

namespace Seed\NullableOptional\Requests;

use Seed\Core\Json\JsonSerializableType;

class SearchUsersRequest extends JsonSerializableType
{
    /**
     * @var string $query
     */
    public string $query;

    /**
     * @var ?string $department
     */
    public ?string $department;

    /**
     * @var ?string $role
     */
    public ?string $role;

    /**
     * @var ?bool $isActive
     */
    public ?bool $isActive;

    /**
     * @param array{
     *   query: string,
     *   department?: ?string,
     *   role?: ?string,
     *   isActive?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->query = $values['query'];$this->department = $values['department'] ?? null;$this->role = $values['role'] ?? null;$this->isActive = $values['isActive'] ?? null;
    }
}
