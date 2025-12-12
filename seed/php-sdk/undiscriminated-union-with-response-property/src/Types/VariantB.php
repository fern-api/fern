<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariantB extends JsonSerializableType
{
    /**
     * @var 'B' $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var int $valueB
     */
    #[JsonProperty('valueB')]
    public int $valueB;

    /**
     * @param array{
     *   type: 'B',
     *   valueB: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
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
