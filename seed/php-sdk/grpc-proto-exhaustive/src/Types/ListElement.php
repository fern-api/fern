<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ListElement extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var ?string $id
     */
    public ?string $id;

    /**
     * @param ?string $id
     */
    public function __construct(
        ?string $id = null,
    ) {
        $this->id = $id;
    }
}
