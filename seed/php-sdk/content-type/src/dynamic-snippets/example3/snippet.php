<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServicePatchComplexRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->patchcomplex(
    'id',
    new ServicePatchComplexRequest([
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
