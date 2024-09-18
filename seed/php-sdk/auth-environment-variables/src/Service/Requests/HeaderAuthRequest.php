<?php

namespace Seed\Service\Requests;

class HeaderAuthRequest
{
    /**
     * @var string $xEndpointHeader Specifies the endpoint key.
     */
    public string $xEndpointHeader;

    /**
     * @param string $xEndpointHeader Specifies the endpoint key.
     */
    public function __construct(
        string $xEndpointHeader,
    ) {
        $this->xEndpointHeader = $xEndpointHeader;
    }
}
