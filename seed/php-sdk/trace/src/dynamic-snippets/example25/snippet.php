<?php

namespace Example;

use Seed\SeedClient;
use Seed\Commons\Types\Language;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->sysprop->setNumWarmInstances(
    Language::Java->value,
    1,
);
