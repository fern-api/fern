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
     * @return Foo
     */
    public function asFoo(): Foo
    {
        if (!($this->value instanceof Foo)) {
            throw new Exception(
                "Expected Foo; got ". get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return Bar
     */
    public function asBar(): Bar
    {
        if (!($this->value instanceof Bar)) {
            throw new Exception(
                "Expected Bar; got ". get_debug_type($this->value),
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
