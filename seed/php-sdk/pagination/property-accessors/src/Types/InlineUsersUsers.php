<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class InlineUsersUsers extends JsonSerializableType
{
    /**
     * @var array<InlineUsersUser> $users
     */
    #[JsonProperty('users'), ArrayType([InlineUsersUser::class])]
    private array $users;

    /**
     * @param array{
     *   users: array<InlineUsersUser>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->users = $values['users'];
    }

    /**
     * @return array<InlineUsersUser>
     */
    public function getUsers(): array
    {
        return $this->users;
    }

    /**
     * @param array<InlineUsersUser> $value
     */
    public function setUsers(array $value): self
    {
        $this->users = $value;
        $this->_setField('users');
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
