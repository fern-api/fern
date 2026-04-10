<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\MapValue;
use Seed\Core\Json\JsonProperty;

class VariableValueFive extends JsonSerializableType
{
    use MapValue;

    /**
     * @var value-of<VariableValueFiveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   keyValuePairs: array<KeyValuePair>,
     *   type: value-of<VariableValueFiveType>,
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
