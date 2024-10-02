<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WithMetadata extends SerializableType
{
    /**
     * @var array<string, string> $metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'string'])]
    public array $metadata;

    /**
     * @param array{
     *   metadata: array<string, string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->metadata = $values['metadata'];
    }
}
