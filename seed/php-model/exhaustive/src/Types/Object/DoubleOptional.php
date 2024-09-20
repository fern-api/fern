<?php

namespace Seed\Types\Object;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DoubleOptional extends SerializableType
{
    /**
     * @var ?string $optionalAlias
     */
    #[JsonProperty("optionalAlias")]
    public ?string $optionalAlias;

    /**
     * @param array{
     *   optionalAlias?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->optionalAlias = $values['optionalAlias'] ?? null;
    }
}
