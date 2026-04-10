<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DebugVariableValueTwo extends JsonSerializableType
{
    /**
     * @var value-of<DebugVariableValueTwoType> $type
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
     *   type: value-of<DebugVariableValueTwoType>,
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
