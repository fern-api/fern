<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;
use Seed\Ec2\Requests\BootInstanceRequest;

$client = new SeedClient(
    token: '<token>',
    environment: Environments::Production(),
);
$client->ec2->bootInstance(
    new BootInstanceRequest([
        'size' => 'size',
    ]),
);
