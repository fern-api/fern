<?php

namespace Seed\Nullableoptional\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\UserRole;
use Seed\Types\UserStatus;

class NullableOptionalFilterByRoleRequest extends JsonSerializableType
{
    /**
     * @var value-of<UserRole> $role
     */
    public string $role;

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
     *   role: value-of<UserRole>,
     *   status?: ?value-of<UserStatus>,
     *   secondaryRole?: ?value-of<UserRole>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->role = $values['role'];
        $this->status = $values['status'] ?? null;
        $this->secondaryRole = $values['secondaryRole'] ?? null;
    }
}
