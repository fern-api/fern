<?php

namespace Seed\Headers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Headers\Types\HeadersSendRequestXEndpointVersion;
use Seed\Core\Json\JsonProperty;

class HeadersSendRequest extends JsonSerializableType
{
    /**
     * @var value-of<HeadersSendRequestXEndpointVersion> $endpointVersion
     */
    public string $endpointVersion;

    /**
     * @var bool $async
     */
    public bool $async;

    /**
     * @var string $query
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @param array{
     *   endpointVersion: value-of<HeadersSendRequestXEndpointVersion>,
     *   async: bool,
     *   query: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->endpointVersion = $values['endpointVersion'];
        $this->async = $values['async'];
        $this->query = $values['query'];
    }
}
