<?php

namespace Example;

use Seed\SeedClient;
use Seed\Identity\Requests\GetTokenIdentityRequest;

$client = new SeedClient(
    clientId: '<clientId>',
    clientSecret: '<clientSecret>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->identity->getToken(
    new GetTokenIdentityRequest([
        'username' => 'username',
        'password' => 'password',
    ]),
);
