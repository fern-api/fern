<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithExtendedResultsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithextendedresults(
    new UsersListWithExtendedResultsRequest([]),
);
