<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WithDocs extends SerializableType
{
    #[JsonProperty("docs")]
    /**
     * @var string $docs
     */
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
