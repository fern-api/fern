<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UserListContainer extends SerializableType
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
    ) {
        $this->users = $values['users'];
    }
}
