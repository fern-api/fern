<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithNullableReferenceBar extends JsonSerializableType
{
    /**
     * @var ?Bar $value
     */
    #[JsonProperty('value')]
    private ?Bar $value;

    /**
     * @param array{
     *   value?: ?Bar,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return ?Bar
     */
    public function getValue(): ?Bar
    {
        return $this->value;
    }

    /**
     * @param ?Bar $value
     */
    public function setValue(?Bar $value = null): self
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
