<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UploadResponse extends SerializableType
{
    /**
     * @var ?int $count
     */
    #[JsonProperty("count")]
    public ?int $count;

    /**
     * @param ?int $count
     */
    public function __construct(
        ?int $count = null,
    ) {
        $this->count = $count;
    }
}
