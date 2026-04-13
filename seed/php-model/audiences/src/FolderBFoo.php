<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FolderBFoo extends JsonSerializableType
{
    /**
     * @var ?FolderCFolderCFoo $foo
     */
    #[JsonProperty('foo')]
    public ?FolderCFolderCFoo $foo;

    /**
     * @param array{
     *   foo?: ?FolderCFolderCFoo,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->foo = $values['foo'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
