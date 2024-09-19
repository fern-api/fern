<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Patient extends SerializableType
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
     * @var array<Script> $scripts
     */
    #[JsonProperty("scripts"), ArrayType([Script::class])]
    public array $scripts;

    /**
     * @param string $resourceType
     * @param string $name
     * @param array<Script> $scripts
     */
    public function __construct(
        string $resourceType,
        string $name,
        array $scripts,
    ) {
        $this->resourceType = $resourceType;
        $this->name = $name;
        $this->scripts = $scripts;
    }
}
