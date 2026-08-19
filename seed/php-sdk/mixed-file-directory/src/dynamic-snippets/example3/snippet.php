<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Events\Metadata\Requests\GetEventMetadataRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->events->metadata->getMetadata(
    new GetEventMetadataRequest([
        'id' => 'id',
    ]),
);
