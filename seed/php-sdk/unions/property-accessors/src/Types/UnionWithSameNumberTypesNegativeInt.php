<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithSameNumberTypesNegativeInt extends JsonSerializableType
{
    /**
     * @var ?int $value
     */
    #[JsonProperty('value')]
    private ?int $value;

    /**
     * @param array{
     *   value?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return ?int
     */
    public function getValue(): ?int
    {
        return $this->value;
    }

    /**
     * @param ?int $value
     */
    public function setValue(?int $value = null): self
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
