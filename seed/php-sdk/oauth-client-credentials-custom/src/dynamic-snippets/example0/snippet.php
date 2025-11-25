<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->getTokenWithClientCredentials(
    new GetTokenRequest([
        'cid' => 'cid',
        'csr' => 'csr',
        'scp' => 'scp',
        'entityId' => 'entity_id',
        'audience' => 'https://api.example.com',
        'grantType' => 'client_credentials',
        'scope' => 'scope',
    ]),
);
