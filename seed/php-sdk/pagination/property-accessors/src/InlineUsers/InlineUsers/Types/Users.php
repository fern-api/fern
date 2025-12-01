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
    private array $users;

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
     * @return array<User>
     */
    public function getUsers(): array {
        return $this->users;}

    /**
     * @param array<User> $value
     */
    public function setUsers(array $value): self {
        $this->users = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
