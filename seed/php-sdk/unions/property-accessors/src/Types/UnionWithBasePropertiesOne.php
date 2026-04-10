<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithBasePropertiesOne extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithBasePropertiesOneType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @var ?string $value
     */
    #[JsonProperty('value')]
    private ?string $value;

    /**
     * @param array{
     *   type: value-of<UnionWithBasePropertiesOneType>,
     *   value?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return value-of<UnionWithBasePropertiesOneType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithBasePropertiesOneType> $value
     */
    public function setType(string $value): self
    {
        $this->type = $value;
        $this->_setField('type');
        return $this;
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
