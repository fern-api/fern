<?php

namespace Seed\User;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class User extends SerializableType
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

    #[JsonProperty("age")]
    /**
     * @var int $age
     */
    public int $age;

    /**
     * @param string $id
     * @param string $name
     * @param int $age
     */
    public function __construct(
        string $id,
        string $name,
        int $age,
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->age = $age;
    }
}
