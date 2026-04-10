<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariableValueTwo extends JsonSerializableType
{
    /**
     * @var value-of<VariableValueTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?float $value
     */
    #[JsonProperty('value')]
    public ?float $value;

    /**
     * @param array{
     *   type: value-of<VariableValueTwoType>,
     *   value?: ?float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
