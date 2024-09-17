<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StringResponse extends SerializableType
{
    #[JsonProperty("data")]
    /**
     * @var string $data
     */
    public string $data;

    /**
     * @param string $data
     */
    public function __construct(
        string $data,
    ) {
        $this->data = $data;
    }
}
