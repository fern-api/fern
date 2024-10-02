<?php

namespace Seed\Users\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UserOptionalListContainer extends SerializableType
{
    /**
     * @var ?array<User> $users
     */
    #[JsonProperty('users'), ArrayType([User::class])]
    public ?array $users;

    /**
     * @param array{
     *   users?: ?array<User>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->users = $values['users'] ?? null;
    }
}
