<?php

namespace Seed;

use Seed\Auth\AuthClient;
use Seed\Core\CoreClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var AuthClient $auth
     */
    public AuthClient $auth;

    /**
     * @var CoreClient $core
     */
    public CoreClient $core;

    /**
     * @var array{
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
     * @var Environments $environment
     */
    private Environments $environment;

    /**
     * @param ?Environments $environment The environment to use for API requests.
     * @param ?string $region The region to substitute into the base URL. Defaults to "us1".
     * @param ?array{
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?Environments $environment = null,
        ?string $region = null,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];
        if ($region != null) {
            if ($environment == null || $environment == Environments::Production() || $environment == Environments::Staging() || $environment == Environments::Development()) {
                if ($environment == Environments::Staging()) {
                    $environment = Environments::custom(
                        acme: 'https://api.stage.' . $region . '.acme.com',
                        oauth: 'https://oauth.stage.' . $region . '.acme.com'
                    );
                } elseif ($environment == Environments::Development()) {
                    $environment = Environments::custom(
                        acme: 'https://api.dev.' . $region . '.acme.com',
                        oauth: 'https://oauth.dev.' . $region . '.acme.com'
                    );
                } else {
                    $environment = Environments::custom(
                        acme: 'https://api.' . $region . '.acme.com',
                        oauth: 'https://oauth.' . $region . '.acme.com'
                    );
                }
            }
        }

        $environment ??= Environments::Production();
        $this->environment = $environment;

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->auth = new AuthClient($this->client, $this->environment);
        $this->core = new CoreClient($this->client, $this->environment);
    }
}
