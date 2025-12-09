<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithRequiredField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->container->getAndReturnMapOfPrimToObject(
    [
        'string' => new ObjectWithRequiredField([
            'string' => 'string',
        ]),
    ],
);
