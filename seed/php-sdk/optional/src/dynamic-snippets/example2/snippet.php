<?php

namespace Example;

use Seed\SeedClient;
use Seed\Optional\Requests\SendOptionalBodyRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->optional->sendoptionaltypedbody(
    new SendOptionalBodyRequest([
        'message' => 'message',
    ]),
);
