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
     * @var array<mixed> $commons
     */
    public array $commons;

    /**
     * @var array<mixed> $file
     */
    public array $file;

    /**
     * @var array<mixed> $health
     */
    public array $health;

    /**
     * @var array<mixed> $service
     */
    public array $service;

    /**
     * @var array<mixed> $types
     */
    public array $types;

    /**
     * @param ?array<string, mixed> $clientOptions
     */
    public function __construct(
        ?array $clientOptions = null,
    ) {
        $defaultHeaders = [
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->client = new RawClient(
            client: isset($clientOptions['client']) ? $clientOptions['client'] : new Client(),
            headers: $defaultHeaders,
        );
        $this->commons = [];
        $this->file = [];
        $this->health = [];
        $this->service = [];
        $this->types = [];
    }
}
