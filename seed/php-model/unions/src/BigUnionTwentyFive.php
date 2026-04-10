<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\CircularCard;
use Seed\Core\Json\JsonProperty;

class BigUnionTwentyFive extends JsonSerializableType
{
    use CircularCard;

    /**
     * @var value-of<BigUnionTwentyFiveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwentyFiveType>,
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
