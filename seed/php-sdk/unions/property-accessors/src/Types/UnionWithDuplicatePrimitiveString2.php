<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithDuplicatePrimitiveString2 extends JsonSerializableType
{
    /**
     * @var ?string $value
     */
    #[JsonProperty('value')]
    private ?string $value;

    /**
     * @param array{
     *   value?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return ?string
     */
    public function getValue(): ?string
    {
        return $this->value;
    }

    /**
     * @param ?string $value
     */
    public function setValue(?string $value = null): self
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
