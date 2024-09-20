<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Entity extends SerializableType
{
    /**
     * @var mixed $type
     */
    #[JsonProperty("type")]
    public mixed $type;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @param array{
     *   type: mixed,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->name = $values['name'];
    }
}
