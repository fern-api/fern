<?php

namespace Seed\Service;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class MyObject extends SerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @param array{
     *   foo: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
    }
}
