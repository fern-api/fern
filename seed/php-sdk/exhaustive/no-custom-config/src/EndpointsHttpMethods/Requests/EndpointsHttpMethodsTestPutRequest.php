<?php

namespace Seed\EndpointsHttpMethods\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TypesObjectWithRequiredField;

class EndpointsHttpMethodsTestPutRequest extends JsonSerializableType
{
    /**
     * @var TypesObjectWithRequiredField $body
     */
    public TypesObjectWithRequiredField $body;

    /**
     * @param array{
     *   body: TypesObjectWithRequiredField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
