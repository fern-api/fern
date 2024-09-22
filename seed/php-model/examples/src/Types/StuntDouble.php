<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StuntDouble extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var string $actorOrActressId
     */
    #[JsonProperty('actorOrActressId')]
    public string $actorOrActressId;

    /**
     * @param array{
     *   name: string,
     *   actorOrActressId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->actorOrActressId = $values['actorOrActressId'];
    }
}
