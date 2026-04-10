<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TriangularRepair;
use Seed\Core\Json\JsonProperty;

class BigUnionTwentySeven extends JsonSerializableType
{
    use TriangularRepair;

    /**
     * @var value-of<BigUnionTwentySevenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwentySevenType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
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
