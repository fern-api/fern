<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithOptionalReferenceBar extends JsonSerializableType
{
    /**
     * @var ?Bar $value
     */
    #[JsonProperty('value')]
    public ?Bar $value;

    /**
     * @param array{
     *   value?: ?Bar,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
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
