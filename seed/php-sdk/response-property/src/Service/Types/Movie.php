<?php

namespace Seed\Service\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Movie extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
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
