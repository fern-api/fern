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
     * @return string
     */
    public function asFern(): string
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
