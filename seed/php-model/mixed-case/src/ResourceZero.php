<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\User;
use Seed\Core\Json\JsonProperty;

class ResourceZero extends JsonSerializableType
{
    use User;

    /**
     * @var value-of<ResourceZeroResourceType> $resourceType
     */
    #[JsonProperty('resource_type')]
    public string $resourceType;

    /**
     * @param array{
     *   userName: string,
     *   metadataTags: array<string>,
     *   extraProperties: array<string, string>,
     *   resourceType: value-of<ResourceZeroResourceType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->userName = $values['userName'];
        $this->metadataTags = $values['metadataTags'];
        $this->extraProperties = $values['extraProperties'];
        $this->resourceType = $values['resourceType'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
