<?php

namespace Seed;

use Seed\Headers\HeadersClient;
use Seed\InlinedRequest\InlinedRequestClient;
use Seed\MultipartForm\MultipartFormClient;
use Seed\PathParam\PathParamClient;
use Seed\QueryParam\QueryParamClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var HeadersClient $headers
     */
    public HeadersClient $headers;

    /**
     * @var InlinedRequestClient $inlinedRequest
     */
    public InlinedRequestClient $inlinedRequest;

    /**
     * @var MultipartFormClient $multipartForm
     */
    public MultipartFormClient $multipartForm;

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
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
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
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
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

        $this->headers = new HeadersClient($this->client, $this->options);
        $this->inlinedRequest = new InlinedRequestClient($this->client, $this->options);
        $this->multipartForm = new MultipartFormClient($this->client, $this->options);
        $this->pathParam = new PathParamClient($this->client, $this->options);
        $this->queryParam = new QueryParamClient($this->client, $this->options);
    }
}
