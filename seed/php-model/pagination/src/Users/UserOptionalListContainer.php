<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UserOptionalListContainer extends SerializableType
{
    /**
     * @var ?array<User> $users
     */
    #[JsonProperty("users"), ArrayType([User::class])]
    public ?array $users;

    /**
     * @param ?array<User> $users
     */
    public function __construct(
        ?array $users = null,
    ) {
        $this->users = $users;
    }
}
