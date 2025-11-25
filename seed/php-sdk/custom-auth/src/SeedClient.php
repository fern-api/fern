<?php

namespace Seed;

use Seed\CustomAuth\CustomAuthClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var CustomAuthClient $customAuth
     */
    public CustomAuthClient $customAuth;

    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param string $customAuthScheme The customAuthScheme to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        string $customAuthScheme,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-API-KEY' => $customAuthScheme,
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


        $this->client = new RawClient(
            options: $this->options,
        );

        $this->customAuth = new CustomAuthClient($this->client, $this->options);
    }
}
