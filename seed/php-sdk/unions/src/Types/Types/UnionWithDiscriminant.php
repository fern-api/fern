<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

class UnionWithDiscriminant extends JsonSerializableType
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
}
