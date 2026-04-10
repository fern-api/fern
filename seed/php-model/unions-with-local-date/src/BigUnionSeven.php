<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\LimpingStep;
use Seed\Core\Json\JsonProperty;

class BigUnionSeven extends JsonSerializableType
{
    use LimpingStep;

    /**
     * @var value-of<BigUnionSevenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionSevenType>,
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
