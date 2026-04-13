<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\User;
use Seed\Core\Json\JsonProperty;

/**
 * Admin user object
 */
class Admin extends JsonSerializableType
{
    use User;

    /**
     * @var string $adminLevel The level of admin privileges.
     */
    #[JsonProperty('adminLevel')]
    public string $adminLevel;

    /**
     * @param array{
     *   password: string,
     *   profile: UserProfile,
     *   adminLevel: string,
     *   id?: ?string,
     *   email?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'] ?? null;
        $this->email = $values['email'] ?? null;
        $this->password = $values['password'];
        $this->profile = $values['profile'];
        $this->adminLevel = $values['adminLevel'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
