<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;

class Shape extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

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
     *   id: string,
     *   type: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @return bool
     */
    public function isCircle(): bool
    {
        return $this->value instanceof Circle && $this->type === "circle";
    }

    /**
     * @return Circle
     */
    public function asCircle(): Circle
    {
        if (!($this->value instanceof Circle && $this->type === "circle")) {
            throw new Exception(
                "Expected circle; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSquare(): bool
    {
        return $this->value instanceof Square && $this->type === "square";
    }

    /**
     * @return Square
     */
    public function asSquare(): Square
    {
        if (!($this->value instanceof Square && $this->type === "square")) {
            throw new Exception(
                "Expected square; got " . $this->type . "with value of type " . get_debug_type($this->value),
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
            case "circle":
                break;
            case "square":
                break;
            case "_unknown":
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                }
        }

        return $result;
    }
}
