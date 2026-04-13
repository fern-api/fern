<?php

namespace Seed;

use Seed\Auth\AuthClient;
use Seed\NestedNoAuthApi\NestedNoAuthApiClient;
use Seed\NestedApi\NestedApiClient;
use Seed\Simple\SimpleClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var AuthClient $auth
     */
    public AuthClient $auth;

    /**
     * @var NestedNoAuthApiClient $nestedNoAuthApi
     */
    public NestedNoAuthApiClient $nestedNoAuthApi;

    /**
     * @var NestedApiClient $nestedApi
     */
    public NestedApiClient $nestedApi;

    /**
     * @var SimpleClient $simple
     */
    public SimpleClient $simple;

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
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];
        if ($token != null) {
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

        $this->auth = new AuthClient($this->client, $this->options);
        $this->nestedNoAuthApi = new NestedNoAuthApiClient($this->client, $this->options);
        $this->nestedApi = new NestedApiClient($this->client, $this->options);
        $this->simple = new SimpleClient($this->client, $this->options);
    }
}
