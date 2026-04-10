<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Language;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->submission->createexecutionsession(
    Language::Java->value,
);
