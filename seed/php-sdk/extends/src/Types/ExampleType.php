<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ExampleType extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
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
