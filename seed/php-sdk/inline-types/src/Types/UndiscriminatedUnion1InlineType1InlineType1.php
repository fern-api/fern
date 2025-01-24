<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * lorem ipsum
 */
class UndiscriminatedUnion1InlineType1InlineType1 extends JsonSerializableType
{
    /**
     * @var string $foo lorem ipsum
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var ReferenceType $ref lorem ipsum
     */
    #[JsonProperty('ref')]
    public ReferenceType $ref;

    /**
     * @param array{
     *   foo: string,
     *   ref: ReferenceType,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->ref = $values['ref'];
    }
}
