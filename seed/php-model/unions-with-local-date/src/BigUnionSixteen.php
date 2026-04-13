<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\GruesomeCoach;
use Seed\Core\Json\JsonProperty;

class BigUnionSixteen extends JsonSerializableType
{
    use GruesomeCoach;

    /**
     * @var value-of<BigUnionSixteenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionSixteenType>,
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
