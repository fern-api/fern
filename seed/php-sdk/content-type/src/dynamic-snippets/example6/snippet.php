<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceOptionalMergePatchTestRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->optionalmergepatchtest(
    new ServiceOptionalMergePatchTestRequest([
        'requiredField' => 'requiredField',
    ]),
);
