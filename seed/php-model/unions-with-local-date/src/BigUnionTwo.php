<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\JumboEnd;
use Seed\Core\Json\JsonProperty;

class BigUnionTwo extends JsonSerializableType
{
    use JumboEnd;

    /**
     * @var value-of<BigUnionTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwoType>,
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
