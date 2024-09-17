<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

/**
* A simple type with just a name.
 */
class Type extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    /**
     * @param string $id
     * @param string $name
     */
    public function __construct(
        string $id,
        string $name,
    ) {
        $this->id = $id;
        $this->name = $name;
    }
}
