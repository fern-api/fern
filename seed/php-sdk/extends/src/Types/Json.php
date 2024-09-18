<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Json extends SerializableType
{
    #[JsonProperty("raw")]
    /**
     * @var string $raw
     */
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
