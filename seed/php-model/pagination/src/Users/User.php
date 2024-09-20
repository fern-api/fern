<?php

namespace Seed\Users;

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
     * @param array{
     *   name: string,
     *   id: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->id = $values['id'];
    }
}
