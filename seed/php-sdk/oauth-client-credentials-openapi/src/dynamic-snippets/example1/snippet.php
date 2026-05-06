<?php

namespace Example;

use Seed\SeedClient;
use Seed\Identity\Requests\IdentityGetTokenRequest;

$client = new SeedClient(
    clientId: '<clientId>',
    clientSecret: '<clientSecret>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->identity->gettoken(
    new IdentityGetTokenRequest([
        'username' => 'username',
        'password' => 'password',
    ]),
);
