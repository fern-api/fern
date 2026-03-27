<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\BulkUpdateTasksRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->bulkUpdateTasks(
    new BulkUpdateTasksRequest([]),
);
