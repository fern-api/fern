<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\PostSubmitRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->submitFormData(
    new PostSubmitRequest([
        'username' => 'johndoe',
        'email' => 'john@example.com',
    ]),
);
