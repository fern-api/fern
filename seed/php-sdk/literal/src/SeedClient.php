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
     * @var array<mixed> $headers
     */
    public array $headers;

    /**
     * @var array<mixed> $inlined
     */
    public array $inlined;

    /**
     * @var array<mixed> $path
     */
    public array $path;

    /**
     * @var array<mixed> $query
     */
    public array $query;

    /**
     * @var array<mixed> $reference
     */
    public array $reference;

    /**
     * @param ?array<string, mixed> $clientOptions
     */
    public function __construct(
        ?array $clientOptions = null,
    ) {
        $defaultHeaders = [
            "X-API-Version" => "02-02-2024",
            "X-API-Enable-Audit-Logging" => "true",
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->client = new RawClient(
            client: isset($clientOptions['client']) ? $clientOptions['client'] : new Client(),
            headers: $defaultHeaders,
        );
        $this->headers = [];
        $this->inlined = [];
        $this->path = [];
        $this->query = [];
        $this->reference = [];
    }
}
