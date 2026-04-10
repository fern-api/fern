<?php

namespace Seed\EndpointsObject\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TypesNestedObjectWithRequiredField;

class EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest extends JsonSerializableType
{
    /**
     * @var TypesNestedObjectWithRequiredField $body
     */
    public TypesNestedObjectWithRequiredField $body;

    /**
     * @param array{
     *   body: TypesNestedObjectWithRequiredField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
