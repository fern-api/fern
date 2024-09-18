<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Parent_ extends SerializableType
{
    #[JsonProperty("parent")]
    /**
     * @var string $parent
     */
    public string $parent;

    /**
     * @param string $parent
     */
    public function __construct(
        string $parent,
    ) {
        $this->parent = $parent;
    }
}
