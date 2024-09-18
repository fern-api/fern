<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class MyObject extends SerializableType
{
    #[JsonProperty("foo")]
    /**
     * @var string $foo
     */
    public string $foo;

    /**
     * @param string $foo
     */
    public function __construct(
        string $foo,
    ) {
        $this->foo = $foo;
    }
}
