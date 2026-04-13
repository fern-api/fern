<?php

namespace Example;

use Seed\SeedClient;
use Seed\Complex\Requests\SearchRequest;
use Seed\Types\SingleFilterSearchRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->complex->search(
    'index',
    new SearchRequest([
        'query' => new SingleFilterSearchRequest([]),
    ]),
);
