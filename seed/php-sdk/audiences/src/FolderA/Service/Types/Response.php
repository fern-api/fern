<?php

namespace Seed\FolderA\Service\Types;

use Seed\Core\Json\SerializableType;
use Seed\FolderB\Common\Types\Foo;
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
