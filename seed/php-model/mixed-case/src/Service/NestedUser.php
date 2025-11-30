<?php

namespace Seed\Service;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedUser extends JsonSerializableType
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
    )
    {
        $this->name = $values['name'];$this->nestedUser = $values['nestedUser'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
