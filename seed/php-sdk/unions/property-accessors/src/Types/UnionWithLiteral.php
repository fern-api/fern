<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithLiteral extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithLiteralType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @var ?value-of<UnionWithLiteralValue> $value
     */
    #[JsonProperty('value')]
    private ?string $value;

    /**
     * @param array{
     *   type: value-of<UnionWithLiteralType>,
     *   value?: ?value-of<UnionWithLiteralValue>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return value-of<UnionWithLiteralType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithLiteralType> $value
     */
    public function setType(string $value): self
    {
        $this->type = $value;
        $this->_setField('type');
        return $this;
    }

    /**
     * @return ?value-of<UnionWithLiteralValue>
     */
    public function getValue(): ?string
    {
        return $this->value;
    }

    /**
     * @param ?value-of<UnionWithLiteralValue> $value
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
