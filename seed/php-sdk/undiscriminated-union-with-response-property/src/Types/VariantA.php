<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariantA extends JsonSerializableType
{
    /**
     * @var string $valueA
     */
    #[JsonProperty('valueA')]
    public string $valueA;

    /**
     * @param array{
     *   valueA: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->valueA = $values['valueA'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
