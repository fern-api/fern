<?php

namespace Seed\FolderB\Common\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\FolderC\Common\Types\Foo;
use Seed\Core\Json\JsonProperty;

class Foo extends JsonSerializableType
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
