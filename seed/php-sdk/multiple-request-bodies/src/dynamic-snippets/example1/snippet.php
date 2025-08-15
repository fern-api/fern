<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\UploadDocumentRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->uploadJsonDocument(
    new UploadDocumentRequest([
        'author' => 'author',
        'tags' => [
            'tags',
            'tags',
        ],
        'title' => 'title',
    ]),
);
