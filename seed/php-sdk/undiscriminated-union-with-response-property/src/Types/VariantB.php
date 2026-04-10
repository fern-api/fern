<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariantB extends JsonSerializableType
{
    /**
     * @var int $valueB
     */
    #[JsonProperty('valueB')]
    public int $valueB;

    /**
     * @param array{
     *   valueB: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->valueB = $values['valueB'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
