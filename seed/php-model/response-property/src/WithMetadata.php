<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class WithMetadata extends SerializableType
{
    /**
     * @var array<string, string> $metadata
     */
    #[JsonProperty("metadata"), ArrayType(["string" => "string"])]
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
