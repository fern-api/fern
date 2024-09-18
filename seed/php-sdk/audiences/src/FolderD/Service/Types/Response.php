<?php

namespace Seed\FolderD\Service\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Response extends SerializableType
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
