<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\StreamEventsContextProtocolRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->streamEventsContextProtocol(
    new StreamEventsContextProtocolRequest([
        'query' => 'query',
    ]),
);
