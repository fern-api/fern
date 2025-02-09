<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->organizations->getOrganizationUser(
    'tenant_id',
    'organization_id',
    'user_id',
);
