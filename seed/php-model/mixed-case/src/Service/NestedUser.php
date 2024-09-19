<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NestedUser extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("Name")]
    public string $name;

    /**
     * @var User $nestedUser
     */
    #[JsonProperty("NestedUser")]
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
