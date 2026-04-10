<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class ContainerValueOptional extends JsonSerializableType
{
    /**
     * @var (
     *    FieldValueZero
     *   |FieldValueOne
     *   |FieldValueTwo
     * )|null $value
     */
    #[JsonProperty('value'), Union(FieldValueZero::class, FieldValueOne::class, FieldValueTwo::class, 'null')]
    public FieldValueZero|FieldValueOne|FieldValueTwo|null $value;

    /**
     * @param array{
     *   value?: (
     *    FieldValueZero
     *   |FieldValueOne
     *   |FieldValueTwo
     * )|null,
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
