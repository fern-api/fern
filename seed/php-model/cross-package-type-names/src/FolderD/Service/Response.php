<?php

namespace Seed\FolderD\Service;

use Seed\Core\Json\SerializableType;
use Seed\FolderB\Common\Foo;
use Seed\Core\Json\JsonProperty;

class Response extends SerializableType
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
        array $values = [],
    ) {
        $this->foo = $values['foo'] ?? null;
    }
}
