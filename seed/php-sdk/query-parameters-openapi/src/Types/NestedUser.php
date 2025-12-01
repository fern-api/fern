<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedUser extends JsonSerializableType
{
    /**
     * @var ?string $name
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?User $user
     */
    #[JsonProperty('user')]
    public ?User $user;

    /**
     * @param array{
     *   name?: ?string,
     *   user?: ?User,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->name = $values['name'] ?? null;$this->user = $values['user'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
