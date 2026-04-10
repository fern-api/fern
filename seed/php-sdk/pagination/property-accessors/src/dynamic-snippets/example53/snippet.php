<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithGlobalConfigRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithglobalconfig(
    new UsersListWithGlobalConfigRequest([
        'offset' => 1,
    ]),
);
