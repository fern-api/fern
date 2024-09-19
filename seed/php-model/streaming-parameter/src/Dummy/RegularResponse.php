<?php

namespace Seed\Dummy;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RegularResponse extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var ?string $name
     */
    #[JsonProperty("name")]
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
}
