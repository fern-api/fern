<?php

namespace Example;

use Seed\SeedClient;
use Seed\Path\Types\PathSendRequestId;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->path->send(
    PathSendRequestId::OneHundredTwentyThree->value,
);
