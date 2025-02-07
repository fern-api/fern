<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;

class UnionWithBaseProperties extends JsonSerializableType
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
     * @return Foo
     */
    public function asFoo(): Foo
    {
        if (!($this->value instanceof Foo)) {
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
