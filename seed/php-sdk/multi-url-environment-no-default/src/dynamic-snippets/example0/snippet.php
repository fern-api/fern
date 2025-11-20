<?php

namespace Example;

use Seed\SeedClient;
use Seed\Ec2\Requests\BootInstanceRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->ec2->bootInstance(
    new BootInstanceRequest([
        'size' => 'size',
    ]),
);
