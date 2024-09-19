<?php

namespace Seed\Union;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetShapeRequest extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
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
