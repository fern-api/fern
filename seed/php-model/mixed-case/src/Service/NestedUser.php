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
     * @param array{
     *   name: string,
     *   nestedUser: User,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->nestedUser = $values['nestedUser'];
    }
}
