<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;
use Seed\Requests\TokenRequest;

$client = new SeedClient(
    environment: Environments::RegionalApiServer(),
);
$client->getToken(
    new TokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
    ]),
);
