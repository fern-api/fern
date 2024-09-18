<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Foo extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    /**
     * @param string $name
     */
    public function __construct(
        string $name,
    ) {
        $this->name = $name;
    }
}
