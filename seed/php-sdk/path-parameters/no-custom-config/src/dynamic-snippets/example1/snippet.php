<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->organizations->getOrganizationUser(
    'organization_id',
    'user_id',
    'tenant_id',
);
