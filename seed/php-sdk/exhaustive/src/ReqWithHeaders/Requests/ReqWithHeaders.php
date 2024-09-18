<?php

namespace Seed\ReqWithHeaders\Requests;

class ReqWithHeaders
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
     * @param string $xTestServiceHeader
     * @param string $xTestEndpointHeader
     * @param string $body
     */
    public function __construct(
        string $xTestServiceHeader,
        string $xTestEndpointHeader,
        string $body,
    ) {
        $this->xTestServiceHeader = $xTestServiceHeader;
        $this->xTestEndpointHeader = $xTestEndpointHeader;
        $this->body = $body;
    }
}
