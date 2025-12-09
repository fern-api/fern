<?php

namespace Seed\Types\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Cat extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var bool $likesToMeow
     */
    #[JsonProperty('likesToMeow')]
    public bool $likesToMeow;

    /**
     * @param array{
     *   name: string,
     *   likesToMeow: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->likesToMeow = $values['likesToMeow'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
