<?php

namespace Seed\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetShapeRequest extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    /**
     * @param string $id
     */
    public function __construct(
        string $id,
    ) {
        $this->id = $id;
    }
}
