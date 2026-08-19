<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\PatchProxyRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->patch(
    new PatchProxyRequest([
        'application' => 'application',
        'requireAuth' => true,
    ]),
);
