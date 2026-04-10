<?php

namespace Example;

use Seed\SeedClient;
use Seed\UserEvents\Requests\UserEventsListEventsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->userEvents->userEventsListEvents(
    new UserEventsListEventsRequest([]),
);
