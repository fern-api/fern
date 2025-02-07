<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

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
        if (!(is_int($this->value))) {
            throw new Exception(
                "Unexpected value type",
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function asString(): string
    {
        if (!(is_string($this->value))) {
            throw new Exception(
                "Unexpected value type",
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
