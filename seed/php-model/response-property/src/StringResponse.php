<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StringResponse extends SerializableType
{
    /**
     * @var string $data
     */
    #[JsonProperty('data')]
    public string $data;

    /**
     * @param array{
     *   data: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
    }
}
