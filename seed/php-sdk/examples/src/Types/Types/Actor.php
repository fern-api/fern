<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Actor extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @param string $name
     * @param string $id
     */
    public function __construct(
        string $name,
        string $id,
    ) {
        $this->name = $name;
        $this->id = $id;
    }
}
