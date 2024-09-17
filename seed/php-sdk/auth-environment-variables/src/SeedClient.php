<?php

namespace Seed;

use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use Seed\Service\ServiceClient;
use GuzzleHttp\Client;

class SeedClient
{
    /**
     * @var ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    private ?array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

    /**
     * @param string $xAnotherHeader
     * @param ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    public function __construct(
        string $xAnotherHeader,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            "X-API-Version" => "01-01-2000",
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->options = $options ?? [];
        $this->client = new RawClient(client: $this->options['client'] ?? new Client(), headers: $defaultHeaders);
        $this->service = new ServiceClient($this->client);
    }
}
