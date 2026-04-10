<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariableValueZero extends JsonSerializableType
{
    /**
     * @var value-of<VariableValueZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?int $value
     */
    #[JsonProperty('value')]
    public ?int $value;

    /**
     * @param array{
     *   type: value-of<VariableValueZeroType>,
     *   value?: ?int,
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
