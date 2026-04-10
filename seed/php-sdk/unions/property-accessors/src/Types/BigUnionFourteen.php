<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ColorfulCover;
use Seed\Core\Json\JsonProperty;

class BigUnionFourteen extends JsonSerializableType
{
    use ColorfulCover;

    /**
     * @var value-of<BigUnionFourteenType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionFourteenType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<BigUnionFourteenType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<BigUnionFourteenType> $value
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
