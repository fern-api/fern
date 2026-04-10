<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\GaseousRoad;
use Seed\Core\Json\JsonProperty;

class BigUnionTwentyEight extends JsonSerializableType
{
    use GaseousRoad;

    /**
     * @var value-of<BigUnionTwentyEightType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwentyEightType>,
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
