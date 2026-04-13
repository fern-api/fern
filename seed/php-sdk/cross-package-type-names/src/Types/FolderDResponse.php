<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FolderDResponse extends JsonSerializableType
{
    /**
     * @var ?FolderBFoo $foo
     */
    #[JsonProperty('foo')]
    public ?FolderBFoo $foo;

    /**
     * @param array{
     *   foo?: ?FolderBFoo,
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
