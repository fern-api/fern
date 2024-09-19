<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Response extends SerializableType
{
    /**
     * @var Movie $data
     */
    #[JsonProperty("data")]
    public Movie $data;

    /**
     * @param Movie $data
     */
    public function __construct(
        Movie $data,
    ) {
        $this->data = $data;
    }
}
