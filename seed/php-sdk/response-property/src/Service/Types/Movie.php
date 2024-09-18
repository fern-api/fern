<?php

namespace Seed\Service\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Movie extends SerializableType
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
