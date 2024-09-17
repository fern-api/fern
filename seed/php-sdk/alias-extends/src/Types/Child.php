<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Child extends SerializableType
{
    #[JsonProperty("child")]
    /**
     * @var string $child
     */
    public string $child;

    /**
     * @param string $child
     */
    public function __construct(
        string $child,
    ) {
        $this->child = $child;
    }
}
