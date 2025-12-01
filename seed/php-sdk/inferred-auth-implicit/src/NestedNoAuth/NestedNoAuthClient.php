<?php

namespace Seed\NestedNoAuth;

use Seed\NestedNoAuth\Api\ApiClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class NestedNoAuthClient 
{
    /**
     * @var ApiClient $api
     */
    public ApiClient $api;

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
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    function __construct(
        RawClient $client,
        ?array $options = null,
    )
    {
        $this->client = $client;
        $this->options = $options ?? [];
        $this->api = new ApiClient($this->client, $this->options);
    }
}
