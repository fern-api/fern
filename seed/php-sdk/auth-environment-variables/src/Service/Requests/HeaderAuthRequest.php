<?php

namespace Seed\Service\Requests;

use Seed\Core\SerializableType;

class HeaderAuthRequest extends SerializableType
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
