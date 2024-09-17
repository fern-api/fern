<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Name extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("value")]
    /**
     * @var string $value
     */
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
