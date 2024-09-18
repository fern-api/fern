<?php

namespace Seed\FolderB\Common;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\FolderC\Common\Foo;

class Foo extends SerializableType
{
    #[JsonProperty("foo")]
    /**
     * @var ?Foo $foo
     */
    public ?Foo $foo;

    /**
     * @param ?Foo $foo
     */
    public function __construct(
        ?Foo $foo = null,
    ) {
        $this->foo = $foo;
    }
}
