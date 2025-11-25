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
     * } $options
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param string $xAnotherHeader
     * @param ?string $apiKey The apiKey to use for authentication.
     * @param ?string $xApiVersion
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        string $xAnotherHeader,
        ?string $apiKey = null,
        ?string $xApiVersion = null,
        ?array $options = null,
    ) {
        $apiKey ??= $this->getFromEnvOrThrow('FERN_API_KEY', 'Please pass in apiKey or set the environment variable FERN_API_KEY.');
        $defaultHeaders = [
            'X-Another-Header' => $xAnotherHeader,
            'X-FERN-API-KEY' => $apiKey,
            'X-API-Version' => '01-01-2000',
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];
        if ($xApiVersion != null) {
            $defaultHeaders['X-API-Version'] = $xApiVersion;
        }

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
    private function getFromEnvOrThrow(string $env, string $message): string
    {
        $value = getenv($env);
        return $value ? (string) $value : throw new Exception($message);
    }
}
