<?php

namespace Seed;

use Seed\Service\ServiceClient;
use GuzzleHttp\ClientInterface;
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
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?array $options = null,
    )
    {
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
        
        $this->client = new RawClient(
            options: $this->options,
        );
        
        $this->service = new ServiceClient($this->client, $this->options);
    }
}
