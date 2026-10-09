<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\IdentifierUpdate;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->updateProfileIdentifier(
    'profile_123',
    'email',
    new IdentifierUpdate([
        'idType' => 'phone',
        'oldValue' => '+13175556789',
        'newValue' => '+13175556798',
    ]),
);
