<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\MistySnow;
use Seed\Core\Json\JsonProperty;

class BigUnionFour extends JsonSerializableType
{
    use MistySnow;

    /**
     * @var value-of<BigUnionFourType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionFourType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<BigUnionFourType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<BigUnionFourType> $value
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
