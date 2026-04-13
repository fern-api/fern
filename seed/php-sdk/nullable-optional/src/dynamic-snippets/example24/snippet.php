<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalGetSearchResultsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->getsearchresults(
    new NullableOptionalGetSearchResultsRequest([
        'query' => 'query',
    ]),
);
