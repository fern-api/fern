<?php

namespace Seed\FolderB\Common\Types;

use Seed\Core\Json\SerializableType;
use Seed\FolderC\Common\Types\FolderCFoo;
use Seed\Core\Json\JsonProperty;

class Foo extends SerializableType
{
    /**
     * @var ?FolderCFoo $foo
     */
    #[JsonProperty('foo')]
    public ?FolderCFoo $foo;

    /**
     * @param array{
     *   foo?: ?FolderCFoo,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->foo = $values['foo'] ?? null;
    }
}
