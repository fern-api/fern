<?php

namespace Seed;

use Seed\Service\ServiceClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Exception;

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
     * @param ?string $headerTokenAuth The headerTokenAuth to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $headerTokenAuth = null,
        ?array $options = null,
    )
    {
        $headerTokenAuth ??= $this->getFromEnvOrThrow('HEADER_TOKEN_ENV_VAR', 'Please pass in headerTokenAuth or set the environment variable HEADER_TOKEN_ENV_VAR.');
        $defaultHeaders = [
            'x-api-key' => "test_prefix $headerTokenAuth",
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

    /**
     * @param string $env
     * @param string $message
     * @return string
     */
    private function getFromEnvOrThrow(string $env, string $message): string {
        $value = getenv($env);
        return $value ? (string) $value : throw new Exception($message);
    }
}
