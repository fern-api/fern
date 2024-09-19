<?php

namespace Seed\FolderD\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Response extends SerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty("foo")]
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
