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
     * @var array<mixed> $v2
     */
    public array $v2;

    /**
     * @var array<mixed> $admin
     */
    public array $admin;

    /**
     * @var array<mixed> $commons
     */
    public array $commons;

    /**
     * @var array<mixed> $homepage
     */
    public array $homepage;

    /**
     * @var array<mixed> $langServer
     */
    public array $langServer;

    /**
     * @var array<mixed> $migration
     */
    public array $migration;

    /**
     * @var array<mixed> $playlist
     */
    public array $playlist;

    /**
     * @var array<mixed> $problem
     */
    public array $problem;

    /**
     * @var array<mixed> $submission
     */
    public array $submission;

    /**
     * @var array<mixed> $sysprop
     */
    public array $sysprop;

    /**
     * @param ?array<string, mixed> $clientOptions
     */
    public function __construct(
        ?array $clientOptions = null,
    ) {
        $defaultHeaders = [
            "X-Random-Header" => $xRandomHeader,
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->client = new RawClient(
            client: isset($clientOptions['client']) ? $clientOptions['client'] : new Client(),
            headers: $defaultHeaders,
        );
        $this->v2 = [];
        $this->admin = [];
        $this->commons = [];
        $this->homepage = [];
        $this->langServer = [];
        $this->migration = [];
        $this->playlist = [];
        $this->problem = [];
        $this->submission = [];
        $this->sysprop = [];
    }
}
