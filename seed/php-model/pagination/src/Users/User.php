<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class User extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("id")]
    /**
     * @var int $id
     */
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
