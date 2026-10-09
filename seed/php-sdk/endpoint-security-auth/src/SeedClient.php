<?php

namespace Seed;

use Seed\Auth\AuthClient;
use Seed\User\UserClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Core\RoutingAuthProvider;
use Seed\Core\OAuthTokenProvider;
use Seed\Core\InferredAuthProvider;

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
     * @var ?RoutingAuthProvider $routingAuthProvider @phpstan-ignore-next-line Property is read in endpoint methods and passed to subclients
     */
    private ?RoutingAuthProvider $routingAuthProvider;

    /**
     * @param ?string $token The token to use for authentication.
     * @param ?string $apiKey The apiKey to use for authentication.
     * @param ?string $username The username to use for authentication.
     * @param ?string $password The password to use for authentication.
     * @param ?string $clientId
     * @param ?string $clientSecret
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
        ?string $apiKey = null,
        ?string $username = null,
        ?string $password = null,
        ?string $clientId = null,
        ?string $clientSecret = null,
        ?array $options = null,
    ) {
        $token ??= getenv('MY_TOKEN') ?: null;
        $apiKey ??= getenv('MY_API_KEY') ?: null;
        $username ??= getenv('MY_USERNAME') ?: null;
        $password ??= getenv('MY_PASSWORD') ?: null;
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

        $oauthTokenProvider = null;
        if ($clientId !== null && $clientSecret !== null) {
            $authRawClient = new RawClient(isset($this->options['baseUrl']) ? ['baseUrl' => $this->options['baseUrl'], 'headers' => []] : ['headers' => []]);
            $authClient = new AuthClient($authRawClient);
            $oauthTokenProvider = new OAuthTokenProvider($clientId, $clientSecret, $authClient);

        }
        $inferredAuthProvider = null;
        if ($clientId !== null && $clientSecret !== null) {
            $authRawClient = new RawClient(isset($this->options['baseUrl']) ? ['baseUrl' => $this->options['baseUrl'], 'headers' => []] : ['headers' => []]);
            $authClient = new AuthClient($authRawClient);
            $inferredAuthOptions = [
                'clientId' => $clientId,
                'clientSecret' => $clientSecret,
                'audience' => 'https://api.example.com',
                'grantType' => 'client_credentials',
            ];
            $inferredAuthProvider = new InferredAuthProvider($authClient, $inferredAuthOptions);

        }
        $this->routingAuthProvider = new RoutingAuthProvider(
            $token,
            $apiKey,
            $oauthTokenProvider,
            $username,
            $password,
            $inferredAuthProvider,
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->auth = new AuthClient($this->client, $this->options, $this->routingAuthProvider);
        $this->user = new UserClient($this->client, $this->options, $this->routingAuthProvider);
    }
}
