<?php

namespace Seed\V2\V3;

use Seed\V2\V3\Problem\ProblemClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class V3Client 
{
    /**
     * @var ProblemClient $problem
     */
    public ProblemClient $problem;

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
        $this->problem = new ProblemClient($this->client, $this->options);
    }
}
