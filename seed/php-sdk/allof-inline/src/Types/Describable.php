<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Describable extends JsonSerializableType
{
    /**
     * @var ?string $name Display name from Describable.
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?string $summary A short summary.
     */
    #[JsonProperty('summary')]
    public ?string $summary;

    /**
     * @param array{
     *   name?: ?string,
     *   summary?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->name = $values['name'] ?? null;
        $this->summary = $values['summary'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
