<?php

namespace Seed\Users;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UserListContainer extends JsonSerializableType
{
    /**
     * @var array<User> $users
     */
    #[JsonProperty('users'), ArrayType([User::class])]
    public array $users;

    /**
     * @param array{
     *   users: array<User>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->users = $values['users'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
