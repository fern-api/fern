<?php

namespace Seed\File;

use Seed\File\Notification\NotificationClient;
use Seed\File\Service\ServiceClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class FileClient
{
    /**
     * @var NotificationClient $notification
     */
    public NotificationClient $notification;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

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
        $this->notification = new NotificationClient($this->client, $this->options);
        $this->service = new ServiceClient($this->client, $this->options);
    }
}
