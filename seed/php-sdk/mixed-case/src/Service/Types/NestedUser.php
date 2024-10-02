<?php

namespace Seed\Service\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class NestedUser extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('Name')]
    public string $name;

    /**
     * @var User $nestedUser
     */
    #[JsonProperty('NestedUser')]
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
