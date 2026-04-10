<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\BasicType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->_->createType(
    BasicType::Primitive->value,
);
