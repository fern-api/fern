<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\StreamEventsDiscriminantInDataRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->streamEventsDiscriminantInData(
    new StreamEventsDiscriminantInDataRequest([
        'query' => 'query',
    ]),
);
