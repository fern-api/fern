<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\RequestTypeInlineType1;
use Seed\Core\Json\JsonProperty;

class PostRootRequest extends JsonSerializableType
{
    /**
     * @var RequestTypeInlineType1 $bar
     */
    #[JsonProperty('bar')]
    public RequestTypeInlineType1 $bar;

    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @param array{
     *   bar: RequestTypeInlineType1,
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
