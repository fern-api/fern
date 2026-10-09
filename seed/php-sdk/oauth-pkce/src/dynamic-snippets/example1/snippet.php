<?php

namespace Example;

use Seed\SeedClient;
use Seed\Oauth\Requests\AuthorizeRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->oauth->authorize(
    new AuthorizeRequest([
        'responseType' => 'code',
        'clientId' => 'client_id',
        'redirectUri' => 'redirect_uri',
        'codeChallenge' => 'code_challenge',
        'codeChallengeMethod' => 'S256',
        'scope' => 'scope',
        'state' => 'state',
    ]),
);
