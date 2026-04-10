<?php

namespace Seed;

use Seed\Auth\AuthClient;
use Seed\User\UserClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var AuthClient $auth
     */
    public AuthClient $auth;

    /**
     * @var UserClient $user
     */
    public UserClient $user;

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
     * @param string $apiKey
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
        string $apiKey,
        ?string $token = null,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-API-Key' => $apiKey,
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
        $this->user = new UserClient($this->client, $this->options);
    }
}
