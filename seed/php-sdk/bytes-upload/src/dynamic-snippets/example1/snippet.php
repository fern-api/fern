<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\UploadWithQueryParamsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->uploadWithQueryParams(
    new UploadWithQueryParamsRequest([
        'model' => 'nova-2',
    ]),
);
