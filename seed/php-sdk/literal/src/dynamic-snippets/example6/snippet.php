<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    version: '02-02-2024',
    auditLogging: true,
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->path->send(
    '123',
);
