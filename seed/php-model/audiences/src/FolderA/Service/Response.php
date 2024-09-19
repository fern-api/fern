<?php

namespace Seed\FolderA\Service;

use Seed\Core\SerializableType;
use Seed\FolderB\Common\Foo;
use Seed\Core\JsonProperty;

class Response extends SerializableType
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
