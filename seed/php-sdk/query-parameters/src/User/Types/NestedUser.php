<?php

namespace Seed\User\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\User\Types\User;

class NestedUser extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("user")]
    /**
     * @var User $user
     */
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
