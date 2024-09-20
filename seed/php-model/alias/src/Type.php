<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

/**
* A simple type with just a name.
 */
class Type extends SerializableType
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
     * @param array{
     *   id: string,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->name = $values['name'];
    }
}
