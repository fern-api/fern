<?php

namespace Seed;

use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use Seed\BasicAuth\BasicAuthClient;
use Seed\Errors\ErrorsClient;
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
     * @var BasicAuthClient $basicAuth
     */
    public BasicAuthClient $basicAuth;

    /**
     * @var ErrorsClient $errors
     */
    public ErrorsClient $errors;

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
        $this->basicAuth = new BasicAuthClient($this->client);
        $this->errors = new ErrorsClient($this->client);
    }
}
