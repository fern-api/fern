<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StuntDouble extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var string $actorOrActressId
     */
    #[JsonProperty("actorOrActressId")]
    public string $actorOrActressId;

    /**
     * @param string $name
     * @param string $actorOrActressId
     */
    public function __construct(
        string $name,
        string $actorOrActressId,
    ) {
        $this->name = $name;
        $this->actorOrActressId = $actorOrActressId;
    }
}
