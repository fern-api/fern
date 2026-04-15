<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Identifiable extends JsonSerializableType
{
    /**
     * @var string $id Unique identifier.
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?string $name Display name from Identifiable.
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @param array{
     *   id: string,
     *   name?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->name = $values['name'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
