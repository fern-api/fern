<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariantC extends JsonSerializableType
{
    /**
     * @var bool $valueC
     */
    #[JsonProperty('valueC')]
    public bool $valueC;

    /**
     * @param array{
     *   valueC: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->valueC = $values['valueC'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
