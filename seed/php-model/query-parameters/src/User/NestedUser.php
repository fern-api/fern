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
     * @param string $name
     * @param User $user
     */
    public function __construct(
        string $name,
        User $user,
    ) {
        $this->name = $name;
        $this->user = $user;
    }
}
