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
    public string $type;

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
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
