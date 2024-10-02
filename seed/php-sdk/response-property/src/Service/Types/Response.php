<?php

namespace Seed\Service\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Response extends SerializableType
{
    /**
     * @var Movie $data
     */
    #[JsonProperty('data')]
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
