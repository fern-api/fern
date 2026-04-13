<?php

namespace Example;

use Seed\SeedClient;
use Seed\UserEventsMetadata\Requests\UserEventsMetadataGetMetadataRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->userEventsMetadata->userEventsMetadataGetMetadata(
    new UserEventsMetadataGetMetadataRequest([
        'id' => 'id',
    ]),
);
