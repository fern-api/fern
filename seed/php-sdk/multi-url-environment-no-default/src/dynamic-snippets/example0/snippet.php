<?php

namespace Example;

use Seed\SeedClient;
use Seed\Ec2\Requests\Ec2BootInstanceRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->ec2->bootinstance(
    new Ec2BootInstanceRequest([
        'size' => 'size',
    ]),
);
