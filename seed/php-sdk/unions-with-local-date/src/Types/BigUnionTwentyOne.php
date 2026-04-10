<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\FrozenSleep;
use Seed\Core\Json\JsonProperty;

class BigUnionTwentyOne extends JsonSerializableType
{
    use FrozenSleep;

    /**
     * @var value-of<BigUnionTwentyOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwentyOneType>,
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
