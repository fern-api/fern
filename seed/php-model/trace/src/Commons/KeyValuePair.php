<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class KeyValuePair extends JsonSerializableType
{
    /**
     * @var VariableValue $key
     */
    #[JsonProperty('key')]
    public VariableValue $key;

    /**
     * @var VariableValue $value
     */
    #[JsonProperty('value')]
    public VariableValue $value;

    /**
     * @param array{
     *   key: VariableValue,
     *   value: VariableValue,
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
