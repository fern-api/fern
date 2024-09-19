<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Failure extends SerializableType
{
    /**
     * @var string $status
     */
    #[JsonProperty("status")]
    public string $status;

    /**
     * @param string $status
     */
    public function __construct(
        string $status,
    ) {
        $this->status = $status;
    }
}
