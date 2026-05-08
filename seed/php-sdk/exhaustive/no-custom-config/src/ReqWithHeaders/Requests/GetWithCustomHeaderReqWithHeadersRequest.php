<?php

namespace Seed\ReqWithHeaders\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetWithCustomHeaderReqWithHeadersRequest extends JsonSerializableType
{
    /**
     * @var string $testEndpointHeader
     */
    public string $testEndpointHeader;

    /**
     * @var string $body
     */
    public string $body;

    /**
     * @param array{
     *   testEndpointHeader: string,
     *   body: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testEndpointHeader = $values['testEndpointHeader'];
        $this->body = $values['body'];
    }
}
