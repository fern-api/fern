<?php

namespace Seed;

use Seed\Auth\AuthClient;
use Seed\User\UserClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Core\InferredAuthProvider;
use Exception;

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
     * @var InferredAuthProvider $inferredAuthProvider
     */
    private InferredAuthProvider $inferredAuthProvider;

    /**
     * @param ?string $token The token to use for authentication.
     * @param ?string $apiKey The apiKey to use for authentication.
     * @param ?string $username The username to use for authentication.
     * @param ?string $password The username to use for authentication.
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
        $token ??= $this->getFromEnvOrThrow('MY_TOKEN', 'Please pass in token or set the environment variable MY_TOKEN.');
        $apiKey ??= $this->getFromEnvOrThrow('MY_API_KEY', 'Please pass in apiKey or set the environment variable MY_API_KEY.');
        $username ??= $this->getFromEnvOrThrow('MY_USERNAME', 'Please pass in username or set the environment variable MY_USERNAME.');
        $password ??= $this->getFromEnvOrThrow('MY_PASSWORD', 'Please pass in password or set the environment variable MY_PASSWORD.');
        $defaultHeaders = [
            'Authorization' => "Bearer $token",
            'X-API-Key' => $apiKey,
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];

        $authRawClient = new RawClient(['headers' => []]);
        $authClient = new AuthClient($authRawClient);
        $inferredAuthOptions = [
            'clientId' => $clientId ?? '',
            'clientSecret' => $clientSecret ?? '',
            'audience' => 'https://api.example.com',
            'grantType' => 'client_credentials',
        ];
        $this->inferredAuthProvider = new InferredAuthProvider($authClient, $inferredAuthOptions);

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->options['getAuthHeaders'] = fn () =>
            $this->inferredAuthProvider->getAuthHeaders();

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->auth = new AuthClient($this->client, $this->options);
        $this->user = new UserClient($this->client, $this->options);
    }

    /**
     * @param string $env
     * @param string $message
     * @return string
     */
    private function getFromEnvOrThrow(string $env, string $message): string
    {
        $value = getenv($env);
        return $value ? (string) $value : throw new Exception($message);
    }
}
