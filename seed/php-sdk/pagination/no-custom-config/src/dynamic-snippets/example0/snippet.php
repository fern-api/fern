<?php

namespace Example;

use Seed\SeedClient;
use Seed\Complex\Types\SearchRequest;
use Seed\Complex\Types\StartingAfterPaging;
use Seed\Complex\Types\SingleFilterSearchRequest;
use Seed\Complex\Types\SingleFilterSearchRequestOperator;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->complex->search(
    new SearchRequest([
        'pagination' => new StartingAfterPaging([
            'perPage' => 1,
            'startingAfter' => 'starting_after',
        ]),
        'query' => new SingleFilterSearchRequest([
            'field' => 'field',
            'operator' => SingleFilterSearchRequestOperator::Equals->value,
            'value' => 'value',
        ]),
    ]),
);
