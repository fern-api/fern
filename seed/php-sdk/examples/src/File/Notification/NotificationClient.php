<?php

namespace Seed\File\Notification;

use Seed\Core\RawClient;
use Seed\File\Notification\Service\ServiceClient;

class NotificationClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

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
        $this->service = new ServiceClient($this->client);
    }
}
