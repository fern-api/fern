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
     * @var array<mixed> $endpoints
     */
    public array $endpoints;

    /**
     * @var array<mixed> $generalErrors
     */
    public array $generalErrors;

    /**
     * @var array<mixed> $inlinedRequests
     */
    public array $inlinedRequests;

    /**
     * @var array<mixed> $noAuth
     */
    public array $noAuth;

    /**
     * @var array<mixed> $noReqBody
     */
    public array $noReqBody;

    /**
     * @var array<mixed> $reqWithHeaders
     */
    public array $reqWithHeaders;

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
        $this->endpoints = [];
        $this->generalErrors = [];
        $this->inlinedRequests = [];
        $this->noAuth = [];
        $this->noReqBody = [];
        $this->reqWithHeaders = [];
        $this->types = [];
    }
}
