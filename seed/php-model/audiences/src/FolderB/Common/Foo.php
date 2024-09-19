<?php

namespace Seed\FolderB\Common;

use Seed\Core\SerializableType;
use Seed\FolderC\Common\FolderCFoo;
use Seed\Core\JsonProperty;

class Foo extends SerializableType
{
    /**
     * @var ?FolderCFoo $foo
     */
    #[JsonProperty("foo")]
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
