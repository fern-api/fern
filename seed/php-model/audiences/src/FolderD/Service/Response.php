<?php

namespace Seed\FolderD\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Response extends SerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty("foo")]
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
