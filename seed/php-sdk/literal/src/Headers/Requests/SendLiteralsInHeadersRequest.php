<?php

namespace Seed\Headers\Requests;

use Seed\Core\JsonProperty;

class SendLiteralsInHeadersRequest
{
    /**
     * @var string $endpointVersion
     */
    public string $endpointVersion;

    /**
     * @var bool $async
     */
    public bool $async;

    /**
     * @var string $query
     */
    #[JsonProperty("query")]
    public string $query;

    /**
     * @param string $endpointVersion
     * @param bool $async
     * @param string $query
     */
    public function __construct(
        string $endpointVersion,
        bool $async,
        string $query,
    ) {
        $this->endpointVersion = $endpointVersion;
        $this->async = $async;
        $this->query = $query;
    }
}
