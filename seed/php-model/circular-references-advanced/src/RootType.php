<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RootType extends SerializableType
{
    #[JsonProperty("s")]
    /**
     * @var string $s
     */
    public string $s;

    /**
     * @param string $s
     */
    public function __construct(
        string $s,
    ) {
        $this->s = $s;
    }
}
