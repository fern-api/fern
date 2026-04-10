<?php

namespace Seed\Inlinedrequests\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Types\TypesObjectWithOptionalField;

class InlinedRequestsPostWithObjectBodyandResponseRequest extends JsonSerializableType
{
    /**
     * @var string $string
     */
    #[JsonProperty('string')]
    public string $string;

    /**
     * @var int $integer
     */
    #[JsonProperty('integer')]
    public int $integer;

    /**
     * @var TypesObjectWithOptionalField $nestedObject
     */
    #[JsonProperty('NestedObject')]
    public TypesObjectWithOptionalField $nestedObject;

    /**
     * @param array{
     *   string: string,
     *   integer: int,
     *   nestedObject: TypesObjectWithOptionalField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->string = $values['string'];
        $this->integer = $values['integer'];
        $this->nestedObject = $values['nestedObject'];
    }
}
