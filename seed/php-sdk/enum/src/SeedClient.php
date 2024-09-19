<?php

namespace Seed;

use Seed\InlinedRequest\InlinedRequestClient;
use Seed\PathParam\PathParamClient;
use Seed\QueryParam\QueryParamClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use GuzzleHttp\Client;

class SeedClient
{
    /**
     * @var InlinedRequestClient $inlinedRequest
     */
    public InlinedRequestClient $inlinedRequest;

    /**
     * @var PathParamClient $pathParam
     */
    public PathParamClient $pathParam;

    /**
     * @var QueryParamClient $queryParam
     */
    public QueryParamClient $queryParam;

    /**
     * @var ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    private ?array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = ["X-Fern-Language" => "PHP","X-Fern-SDK-Name" => "Seed","X-Fern-SDK-Version" => "0.0.1"];
        $this->options = $options ?? [];
        $this->client = new RawClient(
            client: $this->options['client'] ?? new Client(),
            headers: $defaultHeaders,
            options: $this->options,
        );
        $this->inlinedRequest = new InlinedRequestClient($this->client);
        $this->pathParam = new PathParamClient($this->client);
        $this->queryParam = new QueryParamClient($this->client);
    }
}
