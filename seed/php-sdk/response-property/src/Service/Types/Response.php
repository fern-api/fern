<?php

namespace Seed\Service\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Service\Types\Movie;

class Response extends SerializableType
{
    #[JsonProperty("data")]
    /**
     * @var Movie $data
     */
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
