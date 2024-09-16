<?php

namespace Seed\User;

use Seed\Core\RawClient;
use Seed\User\Events\EventsClient;

class UserClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var EventsClient $events
     */
    public EventsClient $events;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
        $this->events = new EventsClient($this->client);
    }
}
