<?php

namespace Example;

use Seed\SeedClient;
use Seed\Optional\Types\SendOptionalBodyRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->optional->sendOptionalTypedBody(
    new SendOptionalBodyRequest([
        'message' => 'message',
    ]),
);
