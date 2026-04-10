<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DetailedOrg extends JsonSerializableType
{
    /**
     * @var ?DetailedOrgMetadata $metadata
     */
    #[JsonProperty('metadata')]
    public ?DetailedOrgMetadata $metadata;

    /**
     * @param array{
     *   metadata?: ?DetailedOrgMetadata,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->metadata = $values['metadata'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
