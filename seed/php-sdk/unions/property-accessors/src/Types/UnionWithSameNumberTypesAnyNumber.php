<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithSameNumberTypesAnyNumber extends JsonSerializableType
{
    /**
     * @var ?float $value
     */
    #[JsonProperty('value')]
    private ?float $value;

    /**
     * @param array{
     *   value?: ?float,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return ?float
     */
    public function getValue(): ?float
    {
        return $this->value;
    }

    /**
     * @param ?float $value
     */
    public function setValue(?float $value = null): self
    {
        $this->value = $value;
        $this->_setField('value');
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
