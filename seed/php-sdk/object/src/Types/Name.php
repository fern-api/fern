<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Name extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var string $value
     */
    #[JsonProperty("value")]
    public string $value;

    /**
     * @param string $id
     * @param string $value
     */
    public function __construct(
        string $id,
        string $value,
    ) {
        $this->id = $id;
        $this->value = $value;
    }
}
