<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Entity extends SerializableType
{
    #[JsonProperty("type")]
    /**
     * @var mixed $type
     */
    public mixed $type;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    /**
     * @param mixed $type
     * @param string $name
     */
    public function __construct(
        mixed $type,
        string $name,
    ) {
        $this->type = $type;
        $this->name = $name;
    }
}
