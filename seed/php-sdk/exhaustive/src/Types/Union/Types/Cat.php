<?php

namespace Seed\Types\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Cat extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var bool $likesToMeow
     */
    #[JsonProperty("likesToMeow")]
    public bool $likesToMeow;

    /**
     * @param array{
     *   name: string,
     *   likesToMeow: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->likesToMeow = $values['likesToMeow'];
    }
}
