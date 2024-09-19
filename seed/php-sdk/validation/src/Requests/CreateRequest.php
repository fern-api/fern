<?php

namespace Seed\Requests;

use Seed\Core\JsonProperty;
use Seed\Types\Shape;

class CreateRequest
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
     * @param array{
     *   decimal: float,
     *   even: int,
     *   name: string,
     *   shape: Shape,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->decimal = $values['decimal'];
        $this->even = $values['even'];
        $this->name = $values['name'];
        $this->shape = $values['shape'];
    }
}
