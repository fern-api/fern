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

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case "integer":
                $value = $this->value;
                $result['integer'] = $value;
                break;
            case "string":
                $value = $this->value;
                $result['string'] = $value;
                break;
            case "_unknown":
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }
}
