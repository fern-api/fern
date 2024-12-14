<?php

namespace Seed\FolderB\Common;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Foo extends JsonSerializableType
{
    /**
     * @var ?\Seed\FolderC\Common\Foo $foo
     */
    #[JsonProperty('foo')]
    public ?\Seed\FolderC\Common\Foo $foo;

    /**
     * @param array{
     *   foo?: ?\Seed\FolderC\Common\Foo,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->foo = $values['foo'] ?? null;
    }
}
