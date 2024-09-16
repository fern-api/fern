<?php

namespace Seed;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use Seed\Service\Client as ServiceClient;

class SeedClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var ?array{
     *     baseUrl?: string,
     *     client?: ClientInterface
     * } $clientOptions
     */
    private ?array $clientOptions;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

    /**
     * @param string $xAnotherHeader
     * @param ?string $apiKey
     * @param ?array{
     *     baseUrl?: string,
     *     client?: ClientInterface
     * } $clientOptions
     *
     * @throws Exception
     */
    public function __construct(
        string $xAnotherHeader,
        ?string $apiKey,
        ?array $clientOptions = null,
    ) {
        $apiKey ??= $this->getFromEnvironmentOrThrow("FERN_API_KEY", "Please pass in apiKey or set the environment variable FERN_API_KEY");
        $defaultHeaders = [
            "X-FERN-API-KEY" => $apiKey,
            "X-API-Version" => "01-01-2000",
            "X-Another-Header" => $xAnotherHeader,
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->clientOptions = $clientOptions ?? [];
        $this->client = new RawClient(
            client: $this->clientOptions['client'] ?? new Client(),
            headers: $defaultHeaders,
        );
        $this->service = new ServiceClient($this->client);
    }

    /**
     * @param string $env
     * @param string $message
     * @return string
     * @throws Exception
     */
    private function getFromEnvironmentOrThrow(string $env, string $message): string
    {
        $value = getenv($env);
        return $value !== false ? (string) $value : throw new Exception($message);
    }
}
