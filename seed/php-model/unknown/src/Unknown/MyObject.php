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
     * @param mixed $unknown
     */
    public function __construct(
        mixed $unknown,
    ) {
        $this->unknown = $unknown;
    }
}
