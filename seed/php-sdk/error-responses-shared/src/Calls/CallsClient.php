<?php

namespace Seed\Calls;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class CallsClient
{
    /**
     * @var \Seed\Calls\Calls\CallsClient $calls
     */
    public \Seed\Calls\Calls\CallsClient $calls;

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
    public function __construct(
        RawClient $client,
        ?array $options = null,
    ) {
        $this->client = $client;
        $this->options = $options ?? [];
        $this->calls = new \Seed\Calls\Calls\CallsClient($this->client, $this->options);
    }
}
