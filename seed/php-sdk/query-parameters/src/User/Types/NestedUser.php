<?php

namespace Seed\User\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class NestedUser extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var User $user
     */
    #[JsonProperty('user')]
    public User $user;

    /**
     * @param array{
     *   name: string,
     *   user: User,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->user = $values['user'];
    }
}
