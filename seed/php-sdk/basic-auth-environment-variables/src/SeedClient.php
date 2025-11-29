<?php

namespace Seed;

use Seed\BasicAuth\BasicAuthClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Exception;

class SeedClient 
{
    /**
     * @var BasicAuthClient $basicAuth
     */
    public BasicAuthClient $basicAuth;

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
     * @param ?string $username The username to use for authentication.
     * @param ?string $accessToken The username to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $username = null,
        ?string $accessToken = null,
        ?array $options = null,
    )
    {
        $username ??= $this->getFromEnvOrThrow('USERNAME', 'Please pass in username or set the environment variable USERNAME.');
        $accessToken ??= $this->getFromEnvOrThrow('PASSWORD', 'Please pass in accessToken or set the environment variable PASSWORD.');
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
        
        $this->basicAuth = new BasicAuthClient($this->client, $this->options);
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
