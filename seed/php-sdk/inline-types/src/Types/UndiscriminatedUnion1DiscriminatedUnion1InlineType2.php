<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * lorem ipsum
 */
class UndiscriminatedUnion1DiscriminatedUnion1InlineType2 extends JsonSerializableType
{
    /**
     * @var string $baz lorem ipsum
     */
    #[JsonProperty('baz')]
    public string $baz;

    /**
     * @var ReferenceType $ref lorem ipsum
     */
    #[JsonProperty('ref')]
    public ReferenceType $ref;

    /**
     * @param array{
     *   baz: string,
     *   ref: ReferenceType,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->baz = $values['baz'];
        $this->ref = $values['ref'];
    }
}
