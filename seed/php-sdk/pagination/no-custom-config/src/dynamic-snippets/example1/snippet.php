<?php

namespace Example;

use Seed\SeedClient;
use Seed\Complex\Requests\SearchRequest;
use Seed\Types\StartingAfterPaging;
use Seed\Types\SingleFilterSearchRequest;
use Seed\Types\SingleFilterSearchRequestOperator;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->complex->search(
    'index',
    new SearchRequest([
        'pagination' => new StartingAfterPaging([
            'perPage' => 1,
            'startingAfter' => 'starting_after',
        ]),
        'query' => new SingleFilterSearchRequest([
            'field' => 'field',
            'operator' => SingleFilterSearchRequestOperator::EqualTo->value,
            'value' => 'value',
        ]),
    ]),
);
