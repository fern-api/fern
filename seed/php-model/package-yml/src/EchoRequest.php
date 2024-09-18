<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class EchoRequest extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("size")]
    /**
     * @var int $size
     */
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
