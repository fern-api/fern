<?php

namespace Seed\InlineUsers\InlineUsers\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Users extends JsonSerializableType
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
