<?php

namespace Seed\FolderD\Service\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\FolderB\Common\Types\Foo;
use Seed\Core\Json\JsonProperty;

class Response extends JsonSerializableType
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
    )
    {
        $this->foo = $values['foo'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
