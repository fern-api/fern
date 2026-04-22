<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Requests\SearchRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->getSearchResults(
    new SearchRequest([
        'query' => 'query',
        'filters' => [
            'filters' => 'filters',
        ],
        'includeTypes' => [
            'includeTypes',
            'includeTypes',
        ],
    ]),
);
