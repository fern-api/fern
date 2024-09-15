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
     * @var array<mixed> $inlinedRequest
     */
    public array $inlinedRequest;

    /**
     * @var array<mixed> $pathParam
     */
    public array $pathParam;

    /**
     * @var array<mixed> $queryParam
     */
    public array $queryParam;

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
        $this->inlinedRequest = [];
        $this->pathParam = [];
        $this->queryParam = [];
    }
}
