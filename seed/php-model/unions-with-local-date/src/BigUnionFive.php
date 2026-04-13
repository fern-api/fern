<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\DistinctFailure;
use Seed\Core\Json\JsonProperty;

class BigUnionFive extends JsonSerializableType
{
    use DistinctFailure;

    /**
     * @var value-of<BigUnionFiveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionFiveType>,
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
