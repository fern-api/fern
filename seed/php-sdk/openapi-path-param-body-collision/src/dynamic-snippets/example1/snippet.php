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
    'profileId',
    'idTypePathParam',
    new IdentifierUpdate([
        'idType' => 'idType',
        'oldValue' => 'oldValue',
        'newValue' => 'newValue',
    ]),
);
