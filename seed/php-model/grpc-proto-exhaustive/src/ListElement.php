<?php

namespace Seed;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class ListElement extends SerializableType
{
    /**
     * @var ?string $id
     */
    #[JsonProperty('id')]
    public ?string $id;

    /**
     * @param array{
     *   id?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->id = $values['id'] ?? null;
    }
}
