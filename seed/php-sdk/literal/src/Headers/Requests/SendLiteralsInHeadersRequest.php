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
     * @param array{
     *   endpointVersion: string,
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
