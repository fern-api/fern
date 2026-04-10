<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\AuthGetTokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->gettoken(
    new AuthGetTokenRequest([
        'apiKey' => 'apiKey',
    ]),
);
