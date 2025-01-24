<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetDiscriminatedUnionRequest extends JsonSerializableType
{
    /**
     * @var mixed $bar
     */
    #[JsonProperty('bar')]
    public mixed $bar;

    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @param array{
     *   bar: mixed,
     *   foo: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->bar = $values['bar'];
        $this->foo = $values['foo'];
    }
}
