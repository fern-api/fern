<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class WithMetadata extends SerializableType
{
    #[JsonProperty("metadata"), ArrayType(["string" => "string"])]
    /**
     * @var array<string, string> $metadata
     */
    public array $metadata;

    /**
     * @param array<string, string> $metadata
     */
    public function __construct(
        array $metadata,
    ) {
        $this->metadata = $metadata;
    }
}
