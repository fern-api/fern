<?php

namespace Example;

use Seed\SeedClient;
use Seed\Migration\Requests\MigrationGetAttemptedMigrationsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->migration->getattemptedmigrations(
    new MigrationGetAttemptedMigrationsRequest([
        'adminKeyHeader' => 'adminKeyHeader',
    ]),
);
