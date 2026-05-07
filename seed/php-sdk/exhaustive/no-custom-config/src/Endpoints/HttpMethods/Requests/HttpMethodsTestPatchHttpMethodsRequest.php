<?php

namespace Seed\Endpoints\HttpMethods\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TypesObjectWithOptionalField;

class HttpMethodsTestPatchHttpMethodsRequest extends JsonSerializableType
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
