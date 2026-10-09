<?php

namespace Example;

use Seed\SeedClient;
use Seed\Products\Requests\SearchProductsRequest;
use Seed\Products\Types\SearchProductsRequestConfig;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->products->search(
    'regionId',
    new SearchProductsRequest([
        'query' => 'query',
        'config' => new SearchProductsRequestConfig([
            'currency' => 'currency',
            'limit' => 1,
        ]),
    ]),
);
