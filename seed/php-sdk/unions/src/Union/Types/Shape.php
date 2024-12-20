<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSkip;
use Seed\Core\Types\DiscriminatedUnion;
use Seed\Core\Types\Discriminant;
use Seed\Union\Types\Circle;
use Seed\Union\Types\Square;

class Shape extends DiscriminatedUnion
{
    /**
     * @var 'circle'|'square'|'_unknown' $type 
     */
    #[JsonProperty('type')]
    #[Discriminant(['circle' => Circle::class, 'square' => Square::class])]
    public string $type;

    /**
     * @var Circle|Square|mixed
     */
    #[JsonSkip]
    public mixed $value;

    /**
     * @param ?array{
     *   type?: 'circle'|'square'|'_unknown',
     *   value?: Circle|Square|mixed,
     * } $options
     */
    public function __construct(
        private readonly ?array $options = null,
    ) {
        $this->type = $this->options['type'] ?? '_unknown';
        $this->value = $this->options['value'] ?? null;
    }

    public static function circle(
        Circle $circle
    ): Shape {
        return new Shape([
            'type' => 'circle',
            'value' => $circle
        ]);
    }

    public static function square(
        Square $square
    ): Shape {
        return new Shape([
            'type' => 'square',
            'value' => $square
        ]);
    }

    public static function _unknown(
        mixed $_unknown
    ): Shape {
        return new Shape([
            'value' => $_unknown
        ]);
    }

    public function asCircle(): Circle
    {
        if ($this->type != 'circle') {
            throw new \Exception(
                "Expected type to be 'circle'; got '$this->type.'"
            );
        }

        if (!($this->value instanceof Circle)) {
            throw new \Exception(
                "Expected value to be instance of Circle."
            );
        }

        return $this->value;
    }

    public function asSquare(): Square
    {
        if ($this->type != 'square') {
            throw new \Exception(
                "Expected type to be 'square'; got '$this->type.'"
            );
        }

        if (!($this->value instanceof Square)) {
            throw new \Exception(
                "Expected value to be instance of Square."
            );
        }

        return $this->value;
    }
}
