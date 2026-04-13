<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ImportingA extends JsonSerializableType
{
    /**
     * @var ?RootType $a
     */
    #[JsonProperty('a')]
    public ?RootType $a;

    /**
     * @param array{
     *   a?: ?RootType,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->a = $values['a'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
