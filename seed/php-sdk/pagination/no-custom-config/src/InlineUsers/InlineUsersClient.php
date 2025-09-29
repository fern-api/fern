<?php

namespace Seed\InlineUsers;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class InlineUsersClient
{
    /**
     * @var \Seed\InlineUsers\InlineUsers\InlineUsersClient $inlineUsers
     */
    public \Seed\InlineUsers\InlineUsers\InlineUsersClient $inlineUsers;

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
        $this->inlineUsers = new \Seed\InlineUsers\InlineUsers\InlineUsersClient($this->client, $this->options);
    }
}
