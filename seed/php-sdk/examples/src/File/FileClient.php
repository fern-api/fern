<?php

namespace Seed\File;

use Seed\Core\RawClient;
use Seed\File\Notification\NotificationClient;
use Seed\File\Service\ServiceClient;

class FileClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var NotificationClient $notification
     */
    public NotificationClient $notification;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

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
