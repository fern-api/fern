<?php

namespace Seed;

use Seed\\Client;
use Seed\FileNotificationService\FileNotificationServiceClient;
use Seed\FileService\FileServiceClient;
use Seed\HealthService\HealthServiceClient;
use Seed\Service\ServiceClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient 
{
    /**
     * @var Client $
     */
    public Client $;

    /**
     * @var FileNotificationServiceClient $fileNotificationService
     */
    public FileNotificationServiceClient $fileNotificationService;

    /**
     * @var FileServiceClient $fileService
     */
    public FileServiceClient $fileService;

    /**
     * @var HealthServiceClient $healthService
     */
    public HealthServiceClient $healthService;

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
     * @param ?string $token The token to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $token = null,
        ?array $options = null,
    )
    {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];
        if ($token != null){
            $defaultHeaders['Authorization'] = "Bearer $token";
        }
        
        $this->options = $options ?? [];
        
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );
        
        $this->client = new RawClient(
            options: $this->options,
        );
        
        $this-> = new Client($this->client, $this->options);
        $this->fileNotificationService = new FileNotificationServiceClient($this->client, $this->options);
        $this->fileService = new FileServiceClient($this->client, $this->options);
        $this->healthService = new HealthServiceClient($this->client, $this->options);
        $this->service = new ServiceClient($this->client, $this->options);
    }
}
