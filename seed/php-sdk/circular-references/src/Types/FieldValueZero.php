<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FieldValueZero extends JsonSerializableType
{
    /**
     * @var value-of<FieldValueZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?value-of<PrimitiveValue> $value
     */
    #[JsonProperty('value')]
    public ?string $value;

    /**
     * @param array{
     *   type: value-of<FieldValueZeroType>,
     *   value?: ?value-of<PrimitiveValue>,
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
