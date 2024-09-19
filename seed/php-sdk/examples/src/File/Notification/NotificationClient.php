<?php

namespace Seed\File\Notification;

use Seed\File\Notification\Service\ServiceClient;
use Seed\Core\RawClient;

class NotificationClient
{
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
        $this->service = new ServiceClient($this->client);
    }
}
