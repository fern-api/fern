<?php

namespace Seed\User\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class User extends SerializableType
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
     * @var int $age
     */
    #[JsonProperty("age")]
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
