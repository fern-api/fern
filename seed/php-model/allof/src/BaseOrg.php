<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BaseOrg extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?BaseOrgMetadata $metadata
     */
    #[JsonProperty('metadata')]
    public ?BaseOrgMetadata $metadata;

    /**
     * @param array{
     *   id: string,
     *   metadata?: ?BaseOrgMetadata,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
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
