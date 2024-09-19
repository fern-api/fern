<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Metadata\Types\Metadata;

class Node extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var ?string $label
     */
    #[JsonProperty("label")]
    public ?string $label;

    /**
     * @var ?Metadata $metadata
     */
    #[JsonProperty("metadata")]
    public ?Metadata $metadata;

    /**
     * @param string $id
     * @param ?string $label
     * @param ?Metadata $metadata
     */
    public function __construct(
        string $id,
        ?string $label = null,
        ?Metadata $metadata = null,
    ) {
        $this->id = $id;
        $this->label = $label;
        $this->metadata = $metadata;
    }
}
