<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    version: '2026-07-15',
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithLiteralVersionHeader();
