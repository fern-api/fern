<?php

namespace Seed\Types\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Cat extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("likesToMeow")]
    /**
     * @var bool $likesToMeow
     */
    public bool $likesToMeow;

    /**
     * @param string $name
     * @param bool $likesToMeow
     */
    public function __construct(
        string $name,
        bool $likesToMeow,
    ) {
        $this->name = $name;
        $this->likesToMeow = $likesToMeow;
    }
}
