<?php

namespace Example;

use Seed\SeedClient;
use Seed\FolderA\Service\Requests\GetDirectThreadRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->folderA->service->getDirectThread(
    new GetDirectThreadRequest([
        'ids' => [
            'ids',
        ],
        'tags' => [
            'tags',
        ],
    ]),
);
