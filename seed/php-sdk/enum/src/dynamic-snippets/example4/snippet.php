<?php

namespace Example;

use Seed\SeedClient;
use Seed\Multipartform\Requests\MultipartFormMultipartFormRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->multipartform->multipartform(
    new MultipartFormMultipartFormRequest([]),
);
