<?php

namespace Seed;

use Seed\Core\RawClient;
use GuzzleHttp\Client;

class SeedClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var array<mixed> $service
     */
    public array $service;

    /**
     * @param string $xAnotherHeader
     * @param ?array<string, mixed> $clientOptions
     */
    public function __construct(
        string $xAnotherHeader,
        ?array $clientOptions = null,
    ) {
        $defaultHeaders = [
            "X-API-Version" => "01-01-2000",
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->client = new RawClient(
            client: isset($clientOptions['client']) ? $clientOptions['client'] : new Client(),
            headers: $defaultHeaders,
        );
        $this->service = [];
    }
}
