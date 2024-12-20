<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSkip;
use Seed\Core\Types\DiscriminatedUnion;
use Seed\Core\Types\Discriminant;

class UnionWithPrimitive extends DiscriminatedUnion
{
    /**
     * @var 'integer'|'string'|'_unknown' $type 
     */
    #[JsonProperty('type')]
    #[Discriminant(['integer' => 'integer', 'string' => 'string'])]
    public string $type;

    /**
     * @var int|string|mixed
     */
    #[JsonSkip]
    public mixed $value;

    /**
     * @param ?array{
     *   type?: 'integer'|'string'|'_unknown',
     *   value?: int|string|mixed,
     * } $options
     */
    public function __construct(
        private readonly ?array $options = null,
    ) {
        $this->type = $this->options['type'] ?? '_unknown';
        $this->value = $this->options['value'] ?? null;
    }

    public static function integer(
        int $integer
    ): UnionWithPrimitive {
        return new UnionWithPrimitive([
            'type' => 'integer',
            'value' => $integer
        ]);
    }

    public static function string(
        string $string
    ): UnionWithPrimitive {
        return new UnionWithPrimitive([
            'type' => 'string',
            'value' => $string
        ]);
    }

    public static function _unknown(
        mixed $_unknown
    ): UnionWithPrimitive {
        return new UnionWithPrimitive([
            'value' => $_unknown
        ]);
    }

    public function asInteger(): int
    {
        if ($this->type != 'circle') {
            throw new \Exception(
                "Expected type to be 'integer'; got '$this->type.'"
            );
        }

        if (!is_int($this->value)) {
            throw new \Exception(
                "Expected value to be int."
            );
        }

        return $this->value;
    }

    public function asString(): string
    {
        if ($this->type != 'string') {
            throw new \Exception(
                "Expected type to be 'string'; got '$this->type.'"
            );
        }

        if (!is_string($this->value)) {
            throw new \Exception(
                "Expected value to be string."
            );
        }

        return $this->value;
    }
}
