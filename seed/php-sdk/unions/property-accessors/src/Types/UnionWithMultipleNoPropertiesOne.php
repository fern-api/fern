<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithMultipleNoPropertiesOne extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithMultipleNoPropertiesOneType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   type: value-of<UnionWithMultipleNoPropertiesOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }

    /**
     * @return value-of<UnionWithMultipleNoPropertiesOneType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithMultipleNoPropertiesOneType> $value
     */
    public function setType(string $value): self
    {
        $this->type = $value;
        $this->_setField('type');
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
