<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

/**
 * This is a simple union.
 */
class Union extends JsonSerializableType
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
    public function isFoo(): bool
    {
        return $this->value instanceof Foo && $this->type === "foo";
    }

    /**
     * @return Foo
     */
    public function asFoo(): Foo
    {
        if (!($this->value instanceof Foo && $this->type === "foo")) {
            throw new Exception(
                "Expected foo; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBar(): bool
    {
        return $this->value instanceof Bar && $this->type === "bar";
    }

    /**
     * @return Bar
     */
    public function asBar(): Bar
    {
        if (!($this->value instanceof Bar && $this->type === "bar")) {
            throw new Exception(
                "Expected bar; got " . $this->type . "with value of type " . get_debug_type($this->value),
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
            case "foo":
                $value = $this->asFoo()->jsonSerialize();
                $result['foo'] = $value;
                break;
            case "bar":
                $value = $this->asBar()->jsonSerialize();
                $result['bar'] = $value;
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
