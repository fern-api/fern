<?php

namespace Seed\Union;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Square extends SerializableType
{
    /**
     * @var float $length
     */
    #[JsonProperty('length')]
    public float $length;

    /**
     * @param array{
     *   length: float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->length = $values['length'];
    }
}
