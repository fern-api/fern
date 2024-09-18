<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StuntDouble extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("actorOrActressId")]
    /**
     * @var string $actorOrActressId
     */
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
