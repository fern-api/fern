<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;

class UnionWithPrimitive extends JsonSerializableType
{
    /**
     * @var string $type
     */
    public readonly string $type;

    /**
     * @var mixed $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @return int
     */
    public function asInteger(): int
    {
    }

    /**
     * @return string
     */
    public function asString(): string
    {
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
