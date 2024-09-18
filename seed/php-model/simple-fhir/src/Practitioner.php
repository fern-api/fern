<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Practitioner extends SerializableType
{
    #[JsonProperty("resource_type")]
    /**
     * @var string $resourceType
     */
    public string $resourceType;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
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
