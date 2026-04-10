<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithMultipleNoPropertiesTwo extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithMultipleNoPropertiesTwoType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   type: value-of<UnionWithMultipleNoPropertiesTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }

    /**
     * @return value-of<UnionWithMultipleNoPropertiesTwoType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithMultipleNoPropertiesTwoType> $value
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
