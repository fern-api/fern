<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TotalWork;
use Seed\Core\Json\JsonProperty;

class BigUnionSeventeen extends JsonSerializableType
{
    use TotalWork;

    /**
     * @var value-of<BigUnionSeventeenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionSeventeenType>,
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
