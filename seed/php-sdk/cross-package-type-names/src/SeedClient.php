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
     * @var array<mixed> $folderA
     */
    public array $folderA;

    /**
     * @var array<mixed> $folderB
     */
    public array $folderB;

    /**
     * @var array<mixed> $folderC
     */
    public array $folderC;

    /**
     * @var array<mixed> $folderD
     */
    public array $folderD;

    /**
     * @var array<mixed> $foo
     */
    public array $foo;

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
        $this->folderA = [];
        $this->folderB = [];
        $this->folderC = [];
        $this->folderD = [];
        $this->foo = [];
    }
}
