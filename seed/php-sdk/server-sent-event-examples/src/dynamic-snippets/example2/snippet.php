<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\CompletionsStreamEventsContextProtocolRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->streameventscontextprotocol(
    new CompletionsStreamEventsContextProtocolRequest([
        'query' => 'query',
    ]),
);
