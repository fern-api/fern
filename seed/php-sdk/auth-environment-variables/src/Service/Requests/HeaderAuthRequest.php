<?php

namespace Seed\Service\Requests;

class HeaderAuthRequest
{
    /**
     * @var string $xEndpointHeader Specifies the endpoint key.
     */
    public string $xEndpointHeader;

    /**
     * @param array{
     *   xEndpointHeader: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->xEndpointHeader = $values['xEndpointHeader'];
    }
}
