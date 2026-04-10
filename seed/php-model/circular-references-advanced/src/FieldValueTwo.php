<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FieldValueTwo extends JsonSerializableType
{
    /**
     * @var value-of<FieldValueTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?ContainerValue $value
     */
    #[JsonProperty('value')]
    public ?ContainerValue $value;

    /**
     * @param array{
     *   type: value-of<FieldValueTwoType>,
     *   value?: ?ContainerValue,
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
