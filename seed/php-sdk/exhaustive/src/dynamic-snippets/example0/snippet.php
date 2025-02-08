<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->container->getAndReturnListOfPrimitives(
    [
        'string',
        'string',
    ],
);
