<?php

namespace Seed\Service\Types;

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
     * @param array{
     *   data: Movie,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
    }
}
