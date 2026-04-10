<?php

namespace Example;

use Seed\SeedClient;
use Seed\FolderAService\Requests\FolderAServiceGetDirectThreadRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->folderAService->folderAServiceGetDirectThread(
    new FolderAServiceGetDirectThreadRequest([
        'ids' => [
            'ids',
        ],
        'tags' => [
            'tags',
        ],
    ]),
);
