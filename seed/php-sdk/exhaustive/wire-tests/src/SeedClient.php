<?php

namespace Seed;

use Seed\Endpoints\EndpointsClient;
use Seed\InlinedRequests\InlinedRequestsClient;
use Seed\NoAuth\NoAuthClient;
use Seed\NoReqBody\NoReqBodyClient;
use Seed\ReqWithHeaders\ReqWithHeadersClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient 
{
    /**
     * @var EndpointsClient $endpoints
     */
    public EndpointsClient $endpoints;

    /**
     * @var InlinedRequestsClient $inlinedRequests
     */
    public InlinedRequestsClient $inlinedRequests;

    /**
     * @var NoAuthClient $noAuth
     */
    public NoAuthClient $noAuth;

    /**
     * @var NoReqBodyClient $noReqBody
     */
    public NoReqBodyClient $noReqBody;

    /**
     * @var ReqWithHeadersClient $reqWithHeaders
     */
    public ReqWithHeadersClient $reqWithHeaders;

    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?string $token The token to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $token = null,
        ?array $options = null,
    )
    {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];
        if ($token != null){
            $defaultHeaders['Authorization'] = "Bearer $token";
        }
        
        $this->options = $options ?? [];
        
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );
        
        $this->client = new RawClient(
            options: $this->options,
        );
        
        $this->endpoints = new EndpointsClient($this->client, $this->options);
        $this->inlinedRequests = new InlinedRequestsClient($this->client, $this->options);
        $this->noAuth = new NoAuthClient($this->client, $this->options);
        $this->noReqBody = new NoReqBodyClient($this->client, $this->options);
        $this->reqWithHeaders = new ReqWithHeadersClient($this->client, $this->options);
    }
}
