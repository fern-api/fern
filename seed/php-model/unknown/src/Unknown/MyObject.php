<?php

namespace Seed\Unknown;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class MyObject extends SerializableType
{
    /**
     * @var mixed $unknown
     */
    #[JsonProperty("unknown")]
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
