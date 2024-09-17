<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Shape;

/**
* Defines properties with default values and validation rules.
 */
class Type extends SerializableType
{
    #[JsonProperty("decimal")]
    /**
     * @var float $decimal
     */
    public float $decimal;

    #[JsonProperty("even")]
    /**
     * @var int $even
     */
    public int $even;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("shape")]
    /**
     * @var Shape $shape
     */
    public Shape $shape;

    /**
     * @param float $decimal
     * @param int $even
     * @param string $name
     * @param Shape $shape
     */
    public function __construct(
        float $decimal,
        int $even,
        string $name,
        Shape $shape,
    ) {
        $this->decimal = $decimal;
        $this->even = $even;
        $this->name = $name;
        $this->shape = $shape;
    }
}
