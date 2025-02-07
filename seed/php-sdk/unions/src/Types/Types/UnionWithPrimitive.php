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
     * @return bool
     */
    public function isInteger(): bool
    {
        return is_int($this->value) && $this->type === "integer";
    }

    /**
     * @return int
     */
    public function asInteger(): int
    {
        if (!(is_int($this->value) && $this->type === "integer")) {
            throw new Exception(
                "Expected integer; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isString(): bool
    {
        return is_string($this->value) && $this->type === "string";
    }

    /**
     * @return string
     */
    public function asString(): string
    {
        if (!(is_string($this->value) && $this->type === "string")) {
            throw new Exception(
                "Expected string; got " . $this->type . "with value of type " . get_debug_type($this->value),
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

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result["type"] = $this->type;

        switch ($this->type) {
            case "integer":
                break;
            case "string":
                break;
            default:
                break;
        }

        return $result;
    }
}
