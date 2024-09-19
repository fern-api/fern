<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Entity extends SerializableType
{
    /**
     * @var mixed $type
     */
    #[JsonProperty("type")]
    public mixed $type;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
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
