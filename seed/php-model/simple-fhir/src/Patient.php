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
    #[JsonProperty('resource_type')]
    public string $resourceType;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var array<Script> $scripts
     */
    #[JsonProperty('scripts'), ArrayType([Script::class])]
    public array $scripts;

    /**
     * @param array{
     *   resourceType: string,
     *   name: string,
     *   scripts: array<Script>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->resourceType = $values['resourceType'];
        $this->name = $values['name'];
        $this->scripts = $values['scripts'];
    }
}
