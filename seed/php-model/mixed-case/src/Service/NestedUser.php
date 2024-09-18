<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Service\User;

class NestedUser extends SerializableType
{
    #[JsonProperty("Name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("NestedUser")]
    /**
     * @var User $nestedUser
     */
    public User $nestedUser;

    /**
     * @param string $name
     * @param User $nestedUser
     */
    public function __construct(
        string $name,
        User $nestedUser,
    ) {
        $this->name = $name;
        $this->nestedUser = $nestedUser;
    }
}
