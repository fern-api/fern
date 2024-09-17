<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\Script;

class Patient extends SerializableType
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

    #[JsonProperty("scripts"), ArrayType([Script])]
    /**
     * @var array<Script> $scripts
     */
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
