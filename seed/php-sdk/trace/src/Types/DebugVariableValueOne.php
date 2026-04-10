<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DebugVariableValueOne extends JsonSerializableType
{
    /**
     * @var value-of<DebugVariableValueOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?bool $value
     */
    #[JsonProperty('value')]
    public ?bool $value;

    /**
     * @param array{
     *   type: value-of<DebugVariableValueOneType>,
     *   value?: ?bool,
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
