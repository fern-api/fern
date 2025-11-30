<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DebugKeyValuePairs extends JsonSerializableType
{
    /**
     * @var DebugVariableValue $key
     */
    #[JsonProperty('key')]
    public DebugVariableValue $key;

    /**
     * @var DebugVariableValue $value
     */
    #[JsonProperty('value')]
    public DebugVariableValue $value;

    /**
     * @param array{
     *   key: DebugVariableValue,
     *   value: DebugVariableValue,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->key = $values['key'];$this->value = $values['value'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
