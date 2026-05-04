<?php

namespace Seed;

use Seed\Items\ItemsClient;
use Seed\Auth\AuthClient;
use Seed\Files\FilesClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var ItemsClient $items
     */
    public ItemsClient $items;

    /**
     * @var AuthClient $auth
     */
    public AuthClient $auth;

    /**
     * @var FilesClient $files
     */
    public FilesClient $files;

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
     * @param ?string $token The token to use for authentication.
     * @param ?Environments $environment The environment to use for API requests.
     * @param ?array{
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $token = null,
        ?Environments $environment = null,
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
        $environment ??= Environments::Production();
        $this->environment = $environment;

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->items = new ItemsClient($this->client, $this->environment);
        $this->auth = new AuthClient($this->client, $this->environment);
        $this->files = new FilesClient($this->client, $this->environment);
    }
}
