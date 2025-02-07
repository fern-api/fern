<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;

class UnionWithLiteral extends JsonSerializableType
{
    /**
     * @var string $base
     */
    #[JsonProperty('base')]
    public string $base;

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
     *   base: string,
     *   type: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->base = $values['base'];
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @return bool
     */
    public function isFern(): bool
    {
        return is_string($this->value) && $this->type === "fern";
    }

    /**
     * @return string
     */
    public function asFern(): string
    {
        if (!(is_string($this->value) && $this->type === "fern")) {
            throw new Exception(
                "Expected fern; got " . $this->type . "with value of type " . get_debug_type($this->value),
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
