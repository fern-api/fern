<?php

namespace Seed\A;

use Seed\A\B\BClient;
use Seed\A\C\CClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class AClient 
{
    /**
     * @var BClient $b
     */
    public BClient $b;

    /**
     * @var CClient $c
     */
    public CClient $c;

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
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    function __construct(
        RawClient $client,
        ?array $options = null,
    )
    {
        $this->client = $client;
        $this->options = $options ?? [];
        $this->b = new BClient($this->client, $this->options);
        $this->c = new CClient($this->client, $this->options);
    }
}
