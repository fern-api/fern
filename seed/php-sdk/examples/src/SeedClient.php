<?php

namespace Seed;

use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use Seed\Commons\CommonsClient;
use Seed\File\FileClient;
use Seed\Health\HealthClient;
use Seed\Service\ServiceClient;
use Seed\Types\TypesClient;
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
     * @var CommonsClient $commons
     */
    public CommonsClient $commons;

    /**
     * @var FileClient $file
     */
    public FileClient $file;

    /**
     * @var HealthClient $health
     */
    public HealthClient $health;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

    /**
     * @var TypesClient $types
     */
    public TypesClient $types;

    /**
     * @param ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = [
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->options = $options ?? [];
        $this->client = new RawClient(client: $this->options['client'] ?? new Client(), headers: $defaultHeaders);
        $this->commons = new CommonsClient($this->client);
        $this->file = new FileClient($this->client);
        $this->health = new HealthClient($this->client);
        $this->service = new ServiceClient($this->client);
        $this->types = new TypesClient($this->client);
    }
}
