<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Users\User;

class UserOptionalListContainer extends SerializableType
{
    #[JsonProperty("users"), ArrayType([User])]
    /**
     * @var ?array<User> $users
     */
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
