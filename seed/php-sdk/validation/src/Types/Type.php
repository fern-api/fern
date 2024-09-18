<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

/**
* Defines properties with default values and validation rules.
 */
class Type extends SerializableType
{
    /**
     * @var float $decimal
     */
    #[JsonProperty("decimal")]
    public float $decimal;

    /**
     * @var int $even
     */
    #[JsonProperty("even")]
    public int $even;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var Shape $shape
     */
    #[JsonProperty("shape")]
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
