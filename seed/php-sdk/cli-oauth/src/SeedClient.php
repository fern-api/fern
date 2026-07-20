<?php

namespace Seed;

use Seed\Auth\AuthClient;
use Seed\System\SystemClient;
use Seed\Pets\PetsClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Core\OAuthTokenProvider;
use Exception;

class SeedClient
{
    /**
     * @var AuthClient $auth
     */
    public AuthClient $auth;

    /**
     * @var SystemClient $system
     */
    public SystemClient $system;

    /**
     * @var PetsClient $pets
     */
    public PetsClient $pets;

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
     * @var OAuthTokenProvider $oauthTokenProvider
     */
    private OAuthTokenProvider $oauthTokenProvider;

    /**
     * @param ?string $clientId The client ID for OAuth authentication.
     * @param ?string $clientSecret The client secret for OAuth authentication.
     * @param ?string $scopes A property required by the OAuth token endpoint.
     * @param ?string $tenant A property required by the OAuth token endpoint.
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
        ?string $scopes = null,
        ?string $tenant = null,
        ?array $options = null,
    ) {
        $clientId ??= $this->getFromEnvOrThrow('ACME_CLIENT_ID', 'Please pass in clientId or set the environment variable ACME_CLIENT_ID.');
        $clientSecret ??= $this->getFromEnvOrThrow('ACME_CLIENT_SECRET', 'Please pass in clientSecret or set the environment variable ACME_CLIENT_SECRET.');
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];

        $authRawClient = new RawClient(['headers' => []]);
        $authClient = new AuthClient($authRawClient);
        $this->oauthTokenProvider = new OAuthTokenProvider($clientId, $clientSecret, $scopes ?? '', $tenant ?? '', $authClient);

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->options['getAuthHeaders'] = fn () =>
            ['Authorization' => "Bearer " . $this->oauthTokenProvider->getToken()];

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->auth = new AuthClient($this->client, $this->options);
        $this->system = new SystemClient($this->client, $this->options);
        $this->pets = new PetsClient($this->client, $this->options);
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
