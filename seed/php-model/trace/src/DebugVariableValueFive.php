<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\DebugMapValue;
use Seed\Core\Json\JsonProperty;

class DebugVariableValueFive extends JsonSerializableType
{
    use DebugMapValue;

    /**
     * @var value-of<DebugVariableValueFiveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   keyValuePairs: array<DebugKeyValuePairs>,
     *   type: value-of<DebugVariableValueFiveType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->keyValuePairs = $values['keyValuePairs'];
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
