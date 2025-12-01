<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StuntDouble extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var string $actorOrActressId
     */
    #[JsonProperty('actorOrActressId')]
    public string $actorOrActressId;

    /**
     * @param array{
     *   name: string,
     *   actorOrActressId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->actorOrActressId = $values['actorOrActressId'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
