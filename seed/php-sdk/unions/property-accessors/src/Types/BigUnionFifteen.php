<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\DisloyalValue;
use Seed\Core\Json\JsonProperty;

class BigUnionFifteen extends JsonSerializableType
{
    use DisloyalValue;

    /**
     * @var value-of<BigUnionFifteenType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionFifteenType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<BigUnionFifteenType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<BigUnionFifteenType> $value
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
