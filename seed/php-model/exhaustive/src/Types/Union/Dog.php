<?php

namespace Seed\Types\Union;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Dog extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var bool $likesToWoof
     */
    #[JsonProperty("likesToWoof")]
    public bool $likesToWoof;

    /**
     * @param array{
     *   name: string,
     *   likesToWoof: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->likesToWoof = $values['likesToWoof'];
    }
}
