<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\BulkUpdateTasksRequest;
use DateTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->bulkUpdateTasks(
    new BulkUpdateTasksRequest([
        'filterAssignedTo' => 'filter_assigned_to',
        'filterIsComplete' => 'filter_is_complete',
        'filterDate' => 'filter_date',
        'fields' => '_fields',
        'bulkUpdateTasksRequestAssignedTo' => 'assigned_to',
        'bulkUpdateTasksRequestDate' => new DateTime('2023-01-15'),
        'bulkUpdateTasksRequestIsComplete' => true,
        'text' => 'text',
    ]),
);
