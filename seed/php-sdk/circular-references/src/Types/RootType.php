<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RootType extends SerializableType
{
    /**
     * @var string $s
     */
    #[JsonProperty("s")]
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
