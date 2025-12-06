<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Square extends JsonSerializableType
{
    /**
     * @var float $length
     */
    #[JsonProperty('length')]
    private float $length;

    /**
     * @param array{
     *   length: float,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->length = $values['length'];
    }

    /**
     * @return float
     */
    public function getLength(): float {
        return $this->length;}

    /**
     * @param float $value
     */
    public function setLength(float $value): self {
        $this->length = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
