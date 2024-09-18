<?php

namespace Seed\FolderB\Common\Types;

use Seed\Core\SerializableType;
use Seed\FolderC\Common\Types\Foo;
use Seed\Core\JsonProperty;

class Foo extends SerializableType
{
    /**
     * @var ?Foo $foo
     */
    #[JsonProperty("foo")]
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
