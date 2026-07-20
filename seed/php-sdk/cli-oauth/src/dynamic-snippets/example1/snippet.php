<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenAuthRequest;
use Seed\Auth\Types\GetTokenAuthRequestAudience;
use Seed\Auth\Types\GetTokenAuthRequestGrantType;

$client = new SeedClient(
    clientId: '<clientId>',
    clientSecret: '<clientSecret>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->getToken(
    new GetTokenAuthRequest([
        'audience' => GetTokenAuthRequestAudience::Pets->value,
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'scopes' => 'scopes',
        'grantType' => GetTokenAuthRequestGrantType::ClientCredentials->value,
        'tenant' => 'tenant',
        'optionalHint' => 'optional_hint',
    ]),
);
