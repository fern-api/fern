<?php

namespace Seed\User;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NestedUser extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var User $user
     */
    #[JsonProperty("user")]
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
