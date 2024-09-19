<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WithDocs extends SerializableType
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
