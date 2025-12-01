<?php

namespace Seed\Types\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Dog extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var bool $likesToWoof
     */
    #[JsonProperty('likesToWoof')]
    public bool $likesToWoof;

    /**
     * @param array{
     *   name: string,
     *   likesToWoof: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->likesToWoof = $values['likesToWoof'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
