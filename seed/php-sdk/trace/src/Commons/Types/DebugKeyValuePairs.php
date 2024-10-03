<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DebugKeyValuePairs extends JsonSerializableType
{
    /**
     * @var mixed $key
     */
    #[JsonProperty('key')]
    public mixed $key;

    /**
     * @var mixed $value
     */
    #[JsonProperty('value')]
    public mixed $value;

    /**
     * @param array{
     *   key: mixed,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->key = $values['key'];
        $this->value = $values['value'];
    }
}
