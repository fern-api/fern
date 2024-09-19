<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\A\A;
use Seed\Core\JsonProperty;

class ImportingA extends SerializableType
{
    /**
     * @var ?A $a
     */
    #[JsonProperty("a")]
    public ?A $a;

    /**
     * @param ?A $a
     */
    public function __construct(
        ?A $a = null,
    ) {
        $this->a = $a;
    }
}
