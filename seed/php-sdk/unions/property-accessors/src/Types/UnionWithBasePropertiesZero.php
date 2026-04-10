<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithBasePropertiesZero extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithBasePropertiesZeroType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @var ?int $value
     */
    #[JsonProperty('value')]
    private ?int $value;

    /**
     * @param array{
     *   type: value-of<UnionWithBasePropertiesZeroType>,
     *   value?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return value-of<UnionWithBasePropertiesZeroType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithBasePropertiesZeroType> $value
     */
    public function setType(string $value): self
    {
        $this->type = $value;
        $this->_setField('type');
        return $this;
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
