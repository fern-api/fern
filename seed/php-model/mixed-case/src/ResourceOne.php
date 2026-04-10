<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Organization;
use Seed\Core\Json\JsonProperty;

class ResourceOne extends JsonSerializableType
{
    use Organization;

    /**
     * @var value-of<ResourceOneResourceType> $resourceType
     */
    #[JsonProperty('resource_type')]
    public string $resourceType;

    /**
     * @param array{
     *   name: string,
     *   resourceType: value-of<ResourceOneResourceType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
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
