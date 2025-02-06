<?php

namespace Seed;

use Seed\InlinedRequest\InlinedRequestClient;
use Seed\PathParam\PathParamClient;
use Seed\QueryParam\QueryParamClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

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
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   headers?: array<string, string>,
     *   maxRetries?: int,
     * } $options
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   headers?: array<string, string>,
     *   maxRetries?: int,
     * } $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->inlinedRequest = new InlinedRequestClient($this->client, $this->options);
        $this->pathParam = new PathParamClient($this->client, $this->options);
        $this->queryParam = new QueryParamClient($this->client, $this->options);
    }
}
