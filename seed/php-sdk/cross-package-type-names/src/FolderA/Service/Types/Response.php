<?php

namespace Seed\FolderA\Service\Types;

use Seed\Core\SerializableType;
use Seed\FolderB\Common\Types\Foo;
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
