<?php

namespace Seed;

use Seed\Auth\AuthClient;
use Seed\NestedNoAuth\NestedNoAuthClient;
use Seed\Nested\NestedClient;
use Seed\Simple\SimpleClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Core\InferredAuthProvider;

class SeedClient
{
    /**
     * @var AuthClient $auth
     */
    public AuthClient $auth;

    /**
     * @var NestedNoAuthClient $nestedNoAuth
     */
    public NestedNoAuthClient $nestedNoAuth;

    /**
     * @var NestedClient $nested
     */
    public NestedClient $nested;

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
     * @param ?string $clientId
     * @param ?string $clientSecret
     * @param ?string $scope
     * @param ?string $xApiKey
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $clientId = null,
        ?string $clientSecret = null,
        ?string $scope = null,
        ?string $xApiKey = null,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];
        if ($xApiKey != null) {
            $defaultHeaders['X-Api-Key'] = $xApiKey;
        }

        $this->options = $options ?? [];

        $authRawClient = new RawClient(['headers' => []]);
        $authClient = new AuthClient($authRawClient);
        $inferredAuthOptions = [
            'clientId' => $clientId ?? '',
            'clientSecret' => $clientSecret ?? '',
            'audience' => 'https://api.example.com',
            'grantType' => 'client_credentials',
            'scope' => $scope ?? '',
            'xApiKey' => $xApiKey ?? '',
        ];
        $inferredAuthProvider = new InferredAuthProvider($authClient, $inferredAuthOptions);
        $authHeaders = $inferredAuthProvider->getAuthHeaders();

        $defaultHeaders = array_merge($defaultHeaders, $authHeaders);
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->auth = new AuthClient($this->client, $this->options);
        $this->nestedNoAuth = new NestedNoAuthClient($this->client, $this->options);
        $this->nested = new NestedClient($this->client, $this->options);
        $this->simple = new SimpleClient($this->client, $this->options);
    }
}
