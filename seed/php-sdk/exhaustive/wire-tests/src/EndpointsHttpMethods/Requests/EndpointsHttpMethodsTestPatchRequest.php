<?php

namespace Seed\EndpointsHttpMethods\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TypesObjectWithOptionalField;

class EndpointsHttpMethodsTestPatchRequest extends JsonSerializableType
{
    /**
     * @var TypesObjectWithOptionalField $body
     */
    public TypesObjectWithOptionalField $body;

    /**
     * @param array{
     *   body: TypesObjectWithOptionalField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
