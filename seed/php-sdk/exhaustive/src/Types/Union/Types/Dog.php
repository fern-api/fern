<?php

namespace Seed\Types\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Dog extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("likesToWoof")]
    /**
     * @var bool $likesToWoof
     */
    public bool $likesToWoof;

    /**
     * @param string $name
     * @param bool $likesToWoof
     */
    public function __construct(
        string $name,
        bool $likesToWoof,
    ) {
        $this->name = $name;
        $this->likesToWoof = $likesToWoof;
    }
}
