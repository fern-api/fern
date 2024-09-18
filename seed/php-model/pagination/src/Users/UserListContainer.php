<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Users\User;

class UserListContainer extends SerializableType
{
    #[JsonProperty("users"), ArrayType([User::class])]
    /**
     * @var array<User> $users
     */
    public array $users;

    /**
     * @param array<User> $users
     */
    public function __construct(
        array $users,
    ) {
        $this->users = $users;
    }
}
