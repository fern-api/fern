<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\PatchComplexRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->patchComplex(
    'id',
    new PatchComplexRequest([
        'name' => 'name',
        'age' => 1,
        'active' => true,
        'metadata' => [
            'metadata' => [
                'key' => "value",
            ],
        ],
        'tags' => [
            'tags',
            'tags',
        ],
        'email' => 'email',
        'nickname' => 'nickname',
        'bio' => 'bio',
        'profileImageUrl' => 'profileImageUrl',
        'settings' => [
            'settings' => [
                'key' => "value",
            ],
        ],
    ]),
);
