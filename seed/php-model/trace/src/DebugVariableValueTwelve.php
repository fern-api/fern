<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\GenericValue;
use Seed\Core\Json\JsonProperty;

class DebugVariableValueTwelve extends JsonSerializableType
{
    use GenericValue;

    /**
     * @var value-of<DebugVariableValueTwelveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   stringifiedValue: string,
     *   type: value-of<DebugVariableValueTwelveType>,
     *   stringifiedType?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->stringifiedType = $values['stringifiedType'] ?? null;
        $this->stringifiedValue = $values['stringifiedValue'];
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
