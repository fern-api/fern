<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class User extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var int $id
     */
    #[JsonProperty("id")]
    public int $id;

    /**
     * @param string $name
     * @param int $id
     */
    public function __construct(
        string $name,
        int $id,
    ) {
        $this->name = $name;
        $this->id = $id;
    }
}
