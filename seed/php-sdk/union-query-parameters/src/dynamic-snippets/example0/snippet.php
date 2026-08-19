<?php

namespace Example;

use Seed\SeedClient;
use Seed\Events\Requests\SubscribeEventsRequest;
use Seed\Events\Types\EventTypeEnum;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->events->subscribe(
    new SubscribeEventsRequest([
        'eventType' => EventTypeEnum::GroupCreated->value,
        'tags' => 'tags',
    ]),
);
