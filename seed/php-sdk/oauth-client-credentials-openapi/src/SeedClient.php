<?php

namespace Seed;

use Seed\Identity\IdentityClient;
use Seed\Plants\PlantsClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Core\OAuthTokenProvider;

class SeedClient
{
    /**
     * @var IdentityClient $identity
     */
    public IdentityClient $identity;

    /**
     * @var PlantsClient $plants
     */
    public PlantsClient $plants;

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
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];

        $authRawClient = new RawClient(['headers' => []]);
        $authClient = new IdentityClient($authRawClient);
        $this->oauthTokenProvider = new OAuthTokenProvider($clientId ?? '', $clientSecret ?? '', $authClient);

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->options['getAuthHeaders'] = fn () =>
            ['Authorization' => "Bearer " . $this->oauthTokenProvider->getToken()];

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->identity = new IdentityClient($this->client, $this->options);
        $this->plants = new PlantsClient($this->client, $this->options);
    }
}
