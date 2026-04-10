<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Square;
use Seed\Core\Json\JsonProperty;

class ShapeOne extends JsonSerializableType
{
    use Square;

    /**
     * @var value-of<ShapeOneType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   length: float,
     *   type: value-of<ShapeOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->length = $values['length'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<ShapeOneType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<ShapeOneType> $value
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
