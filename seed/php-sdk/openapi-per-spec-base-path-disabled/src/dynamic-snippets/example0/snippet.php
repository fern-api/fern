<?php

namespace Example;

use Seed\SeedClient;
use Seed\Oauth\Requests\GetTokenRequest;

$client = new SeedClient(
    clientId: '<clientId>',
    clientSecret: '<clientSecret>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->oauth->getToken(
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
    ]),
);
