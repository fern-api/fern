<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithDiscriminantBar extends JsonSerializableType
{
    /**
     * @var ?Bar $bar
     */
    #[JsonProperty('bar')]
    public ?Bar $bar;

    /**
     * @param array{
     *   bar?: ?Bar,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->bar = $values['bar'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
