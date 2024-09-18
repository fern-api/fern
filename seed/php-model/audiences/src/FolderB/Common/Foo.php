<?php

namespace Seed\FolderB\Common;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\FolderC\Common\FolderCFoo;

class Foo extends SerializableType
{
    #[JsonProperty("foo")]
    /**
     * @var ?FolderCFoo $foo
     */
    public ?FolderCFoo $foo;

    /**
     * @param ?FolderCFoo $foo
     */
    public function __construct(
        ?FolderCFoo $foo = null,
    ) {
        $this->foo = $foo;
    }
}
