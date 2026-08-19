<?php

namespace Example;

use Seed\SeedClient;
use Seed\Products\Requests\SearchProductsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->products->search(
    'regionId',
    new SearchProductsRequest([]),
);
