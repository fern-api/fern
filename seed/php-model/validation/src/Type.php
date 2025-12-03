<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Defines properties with default values and validation rules.
 */
class Type extends JsonSerializableType
{
    /**
     * @var float $decimal
     */
    #[JsonProperty('decimal')]
    public float $decimal;

    /**
     * @var int $even
     */
    #[JsonProperty('even')]
    public int $even;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var value-of<Shape> $shape
     */
    #[JsonProperty('shape')]
    public string $shape;

    /**
     * @param array{
     *   decimal: float,
     *   even: int,
     *   name: string,
     *   shape: value-of<Shape>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->decimal = $values['decimal'];$this->even = $values['even'];$this->name = $values['name'];$this->shape = $values['shape'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
