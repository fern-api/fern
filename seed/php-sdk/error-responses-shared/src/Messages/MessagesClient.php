<?php

namespace Seed\Messages;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class MessagesClient
{
    /**
     * @var \Seed\Messages\Messages\MessagesClient $messages
     */
    public \Seed\Messages\Messages\MessagesClient $messages;

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
        $this->messages = new \Seed\Messages\Messages\MessagesClient($this->client, $this->options);
    }
}
