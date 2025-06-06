<?php

namespace Seed;

use Seed\Bigunion\BigunionClient;
use Seed\Union\UnionClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var BigunionClient $bigunion
     */
    public BigunionClient $bigunion;

    /**
     * @var UnionClient $union
     */
    public UnionClient $union;

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
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?array $options = null,
    ) {
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

        $this->bigunion = new BigunionClient($this->client, $this->options);
        $this->union = new UnionClient($this->client, $this->options);
    }
}
