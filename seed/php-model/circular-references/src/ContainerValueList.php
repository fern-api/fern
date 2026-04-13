<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class ContainerValueList extends JsonSerializableType
{
    /**
     * @var ?array<(
     *    FieldValueZero
     *   |FieldValueOne
     *   |FieldValueTwo
     * )> $value
     */
    #[JsonProperty('value'), ArrayType([new Union(FieldValueZero::class, FieldValueOne::class, FieldValueTwo::class)])]
    public ?array $value;

    /**
     * @param array{
     *   value?: ?array<(
     *    FieldValueZero
     *   |FieldValueOne
     *   |FieldValueTwo
     * )>,
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
