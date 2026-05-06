<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\SubmitFormDataRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->submitFormData(
    new SubmitFormDataRequest([
        'username' => 'username',
        'email' => 'email',
    ]),
);
