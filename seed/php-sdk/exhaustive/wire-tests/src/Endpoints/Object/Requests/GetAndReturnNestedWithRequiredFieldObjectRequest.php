<?php

namespace Seed\Endpoints\Object\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TypesNestedObjectWithRequiredField;

class GetAndReturnNestedWithRequiredFieldObjectRequest extends JsonSerializableType
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
