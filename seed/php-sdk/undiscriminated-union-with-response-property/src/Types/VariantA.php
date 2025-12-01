<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariantA extends JsonSerializableType
{
    /**
     * @var 'A' $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $valueA
     */
    #[JsonProperty('valueA')]
    public string $valueA;

    /**
     * @param array{
     *   type: 'A',
     *   valueA: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->valueA = $values['valueA'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
