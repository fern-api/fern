<?php

namespace Seed\Endpoints\HttpMethods\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TypesObjectWithRequiredField;

class HttpMethodsTestPutHttpMethodsRequest extends JsonSerializableType
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
