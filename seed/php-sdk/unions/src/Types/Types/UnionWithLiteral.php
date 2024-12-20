<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSkip;
use Seed\Core\Types\DiscriminatedUnion;
use Seed\Core\Types\Discriminant;

class UnionWithLiteral extends DiscriminatedUnion
{
    /**
     * @var 'base' $base
     */
    #[JsonProperty('base')]
    public string $base;

    /**
     * @var 'fern'|'_unknown' $type 
     */
    #[JsonProperty('type')]
    #[Discriminant(['fern' => 'fern'])]
    public string $type;

    /**
     * @var 'fern'|mixed
     */
    #[JsonSkip]
    public mixed $value;

    /**
     * @param array{
     *   base: 'base',
     *   type?: 'fern'|'_unknown',
     *   value?: 'fern'|mixed,
     * } $options
     */
    public function __construct(
        private readonly array $options,
    ) {
        $this->base = $this->options['base'];
        $this->type = $this->options['type'] ?? '_unknown';
        $this->value = $this->options['value'] ?? null;
    }

    public static function fern(): UnionWithLiteral
    {
        return new UnionWithLiteral([
            'base' => 'base',
            'type' => 'fern',
            'value' => 'fern'
        ]);
    }

    public static function _unknown(
        mixed $_unknown
    ): UnionWithLiteral {
        return new UnionWithLiteral([
            'base' => 'base',
            'value' => $_unknown
        ]);
    }

    public function asFern(): string
    {
        if ($this->type != 'fern') {
            throw new \Exception(
                "Expected type to be 'fern'; got '$this->type.'"
            );
        }

        if ($this->value !== 'fern') {
            throw new \Exception(
                "Expected value to be \"fern\"."
            );
        }

        return $this->value;
    }
}
