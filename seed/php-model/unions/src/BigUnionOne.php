<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ThankfulFactor;
use Seed\Core\Json\JsonProperty;

class BigUnionOne extends JsonSerializableType
{
    use ThankfulFactor;

    /**
     * @var value-of<BigUnionOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionOneType>,
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
