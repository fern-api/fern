<?php

namespace Seed\Reqwithheaders\Requests;

use Seed\Core\Json\JsonSerializableType;

class ReqWithHeadersGetWithCustomHeaderRequest extends JsonSerializableType
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
