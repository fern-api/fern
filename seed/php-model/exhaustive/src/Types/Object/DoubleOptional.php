<?php

namespace Seed\Types\Object;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DoubleOptional extends JsonSerializableType
{
    /**
     * @var ?string $optionalAlias
     */
    #[JsonProperty('optionalAlias')]
    public ?string $optionalAlias;

    /**
     * @param array{
     *   optionalAlias?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->optionalAlias = $values['optionalAlias'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
