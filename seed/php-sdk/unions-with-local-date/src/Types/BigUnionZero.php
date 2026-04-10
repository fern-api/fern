<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\NormalSweet;
use Seed\Core\Json\JsonProperty;

class BigUnionZero extends JsonSerializableType
{
    use NormalSweet;

    /**
     * @var value-of<BigUnionZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionZeroType>,
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
