<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithNoPropertiesType extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithNoPropertiesTypeType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   type: value-of<UnionWithNoPropertiesTypeType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }

    /**
     * @return value-of<UnionWithNoPropertiesTypeType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithNoPropertiesTypeType> $value
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
