<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Docs extends SerializableType
{
    /**
     * @var string $docs
     */
    #[JsonProperty("docs")]
    public string $docs;

    /**
     * @param string $docs
     */
    public function __construct(
        string $docs,
    ) {
        $this->docs = $docs;
    }
}
