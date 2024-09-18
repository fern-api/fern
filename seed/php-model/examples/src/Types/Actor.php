<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Actor extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("id")]
    /**
     * @var string $id
     */
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
