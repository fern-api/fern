<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\HoarseMouse;
use Seed\Core\Json\JsonProperty;

class BigUnionTwentyFour extends JsonSerializableType
{
    use HoarseMouse;

    /**
     * @var value-of<BigUnionTwentyFourType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwentyFourType>,
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
