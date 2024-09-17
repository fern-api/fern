<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Metadata\Metadata;

class Node extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("label")]
    /**
     * @var ?string $label
     */
    public ?string $label;

    #[JsonProperty("metadata")]
    /**
     * @var ?Metadata $metadata
     */
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
