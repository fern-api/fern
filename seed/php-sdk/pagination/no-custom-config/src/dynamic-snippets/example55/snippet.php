<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithOptionalDataRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithoptionaldata(
    new UsersListWithOptionalDataRequest([
        'page' => 1,
    ]),
);
