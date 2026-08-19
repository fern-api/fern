<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;
use Seed\Auth\Requests\AuthGetTokenRequest;

$client = new SeedClient(
    token: '<token>',
    environment: Environments::Production(),
);
$client->auth->gettoken(
    new AuthGetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
    ]),
);
