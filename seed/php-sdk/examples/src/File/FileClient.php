<?php

namespace Seed\File;

use Seed\File\Notification\NotificationClient;
use Seed\File\Service\ServiceClient;
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
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
        $this->notification = new NotificationClient($this->client);
        $this->service = new ServiceClient($this->client);
    }
}
