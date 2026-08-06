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
        'clientId' => 'client_abc123',
        'redirectUri' => 'https://example.com/callback',
        'codeChallenge' => 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        'codeChallengeMethod' => 'S256',
        'scope' => 'read write',
        'state' => 'xyz',
    ]),
);
