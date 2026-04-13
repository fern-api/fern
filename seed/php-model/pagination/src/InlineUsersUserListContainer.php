<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class InlineUsersUserListContainer extends JsonSerializableType
{
    /**
     * @var array<InlineUsersUser> $users
     */
    #[JsonProperty('users'), ArrayType([InlineUsersUser::class])]
    public array $users;

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
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
