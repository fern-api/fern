<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\SearchRuleTypesRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->searchRuleTypes(
    new SearchRuleTypesRequest([]),
);
