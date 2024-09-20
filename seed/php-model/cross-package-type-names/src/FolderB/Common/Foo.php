<?php

namespace Seed\FolderB\Common;

use Seed\Core\SerializableType;
use Seed\FolderC\Common\Foo;
use Seed\Core\JsonProperty;

class Foo extends SerializableType
{
    /**
     * @var ?Foo $foo
     */
    #[JsonProperty('foo')]
    public ?Foo $foo;

    /**
     * @param array{
     *   foo?: ?Foo,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'] ?? null;
    }
}
