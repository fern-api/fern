<?php

namespace Seed\ReqWithHeaders\Requests;

use Seed\Core\Json\JsonSerializableType;

class ReqWithHeaders extends JsonSerializableType
{
    /**
     * @var string $xTestServiceHeader
     */
    public string $xTestServiceHeader;

    /**
     * @var string $xTestEndpointHeader
     */
    public string $xTestEndpointHeader;

    /**
     * @var string $body
     */
    public string $body;

    /**
     * @param array{
     *   xTestServiceHeader: string,
     *   xTestEndpointHeader: string,
     *   body: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->xTestServiceHeader = $values['xTestServiceHeader'];
        $this->xTestEndpointHeader = $values['xTestEndpointHeader'];
        $this->body = $values['body'];
    }
}
