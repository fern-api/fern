<?php

namespace Seed;

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
     *   id: string,
     *   email: string,
     *   password: string,
     *   profile: UserProfile,
     *   adminLevel: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->email = $values['email'];$this->password = $values['password'];$this->profile = $values['profile'];$this->adminLevel = $values['adminLevel'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
