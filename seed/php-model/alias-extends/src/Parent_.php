<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Parent_ extends JsonSerializableType
{
    /**
     * @var string $parent
     */
    #[JsonProperty('parent')]
    public string $parent;

    /**
     * @param array{
     *   parent: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->parent = $values['parent'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
