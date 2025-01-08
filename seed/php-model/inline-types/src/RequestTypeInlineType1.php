<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * lorem ipsum
 */
class RequestTypeInlineType1 extends JsonSerializableType
{
    /**
     * @var string $foo lorem ipsum
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
