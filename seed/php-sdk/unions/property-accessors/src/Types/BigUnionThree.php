<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\HastyPain;
use Seed\Core\Json\JsonProperty;

class BigUnionThree extends JsonSerializableType
{
    use HastyPain;

    /**
     * @var value-of<BigUnionThreeType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionThreeType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<BigUnionThreeType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<BigUnionThreeType> $value
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
