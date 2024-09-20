<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ListElement extends SerializableType
{
    /**
     * @var ?string $id
     */
    #[JsonProperty("id")]
    public ?string $id;

    /**
     * @param array{
     *   id?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'] ?? null;
    }
}
