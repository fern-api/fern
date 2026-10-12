<?php

namespace Seed;

use Seed\Service\ServiceClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   rootVariable?: string,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?string $rootVariable Falls back to the ROOT_VARIABLE environment variable when not passed to the client.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   rootVariable?: string,
     * } $options
     */
    public function __construct(
        ?string $rootVariable = null,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];
        $rootVariable ??= $this->options['rootVariable'] ?? (getenv('ROOT_VARIABLE') ?: null);
        if ($rootVariable !== null) {
            $this->options['rootVariable'] = $rootVariable;
        }

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->service = new ServiceClient($this->client, $this->options);
    }
}
