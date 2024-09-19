<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Practitioner extends SerializableType
{
    /**
     * @var string $resourceType
     */
    #[JsonProperty("resource_type")]
    public string $resourceType;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @param string $resourceType
     * @param string $name
     */
    public function __construct(
        string $resourceType,
        string $name,
    ) {
        $this->resourceType = $resourceType;
        $this->name = $name;
    }
}
