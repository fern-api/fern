<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithLiteral extends JsonSerializableType
{
    /**
     * @var string $base
     */
    #[JsonProperty('base')]
    public string $base;

    /**
     * @param array{
     *   base: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->base = $values['base'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
