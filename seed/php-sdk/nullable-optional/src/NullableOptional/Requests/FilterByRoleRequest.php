<?php

namespace Seed\NullableOptional\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\NullableOptional\Types\UserRole;
use Seed\NullableOptional\Types\UserStatus;

class FilterByRoleRequest extends JsonSerializableType
{
    /**
     * @var ?value-of<UserRole> $role
     */
    public ?string $role;

    /**
     * @var ?value-of<UserStatus> $status
     */
    public ?string $status;

    /**
     * @var ?value-of<UserRole> $secondaryRole
     */
    public ?string $secondaryRole;

    /**
     * @param array{
     *   role?: ?value-of<UserRole>,
     *   status?: ?value-of<UserStatus>,
     *   secondaryRole?: ?value-of<UserRole>,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->role = $values['role'] ?? null;$this->status = $values['status'] ?? null;$this->secondaryRole = $values['secondaryRole'] ?? null;
    }
}
