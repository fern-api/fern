<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Json extends SerializableType
{
    /**
     * @var string $raw
     */
    #[JsonProperty("raw")]
    public string $raw;

    /**
     * @param string $raw
     */
    public function __construct(
        string $raw,
    ) {
        $this->raw = $raw;
    }
}
