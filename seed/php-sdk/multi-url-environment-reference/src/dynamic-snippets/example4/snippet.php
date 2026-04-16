<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;
use Seed\Files\Requests\FilesUploadRequest;

$client = new SeedClient(
    token: '<token>',
    environment: Environments::Production(),
);
$client->files->upload(
    new FilesUploadRequest([
        'name' => 'name',
        'parentId' => 'parent_id',
    ]),
);
