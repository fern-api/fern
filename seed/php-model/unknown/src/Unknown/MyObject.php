<?php

namespace Seed\Unknown;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class MyObject extends SerializableType
{
    /**
     * @var mixed $unknown
     */
    #[JsonProperty('unknown')]
    public mixed $unknown;

    /**
     * @param array{
     *   unknown: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->unknown = $values['unknown'];
    }
}
