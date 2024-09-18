<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\A\Types\A;

class ImportingA extends SerializableType
{
    #[JsonProperty("a")]
    /**
     * @var ?A $a
     */
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
