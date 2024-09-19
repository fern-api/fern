<?php

namespace Seed\Types\Union;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Cat extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var bool $likesToMeow
     */
    #[JsonProperty("likesToMeow")]
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
