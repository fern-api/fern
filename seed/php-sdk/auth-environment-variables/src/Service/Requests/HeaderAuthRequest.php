<?php

namespace Seed\Service\Requests;

class HeaderAuthRequest
{
    /**
     * Specifies the endpoint key.
     *
     * @param string $xEndpointHeader
     */
    public function __construct(
        public string $xEndpointHeader,
    )
    {
    }
}
