<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class EchoRequest extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var int $size
     */
    #[JsonProperty("size")]
    public int $size;

    /**
     * @param string $name
     * @param int $size
     */
    public function __construct(
        string $name,
        int $size,
    ) {
        $this->name = $name;
        $this->size = $size;
    }
}
