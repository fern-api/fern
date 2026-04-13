<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceGetUserByIdRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getuserbyid(
    'userId',
    new ServiceGetUserByIdRequest([
        'fields' => 'fields',
        'includeFields' => true,
    ]),
);
