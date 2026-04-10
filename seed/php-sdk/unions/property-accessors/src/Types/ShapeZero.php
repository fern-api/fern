<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Circle;
use Seed\Core\Json\JsonProperty;

class ShapeZero extends JsonSerializableType
{
    use Circle;

    /**
     * @var value-of<ShapeZeroType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   radius: float,
     *   type: value-of<ShapeZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->radius = $values['radius'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<ShapeZeroType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<ShapeZeroType> $value
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
