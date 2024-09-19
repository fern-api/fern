<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UserListContainer extends SerializableType
{
    /**
     * @var array<User> $users
     */
    #[JsonProperty("users"), ArrayType([User::class])]
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
