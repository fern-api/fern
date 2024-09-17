<?php

namespace Seed\Types\Object;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DoubleOptional extends SerializableType
{
    #[JsonProperty("optionalAlias")]
    /**
     * @var ?string $optionalAlias
     */
    public ?string $optionalAlias;

    /**
     * @param ?string $optionalAlias
     */
    public function __construct(
        ?string $optionalAlias = null,
    ) {
        $this->optionalAlias = $optionalAlias;
    }
}
