<?php

namespace Example;

use Seed\SeedClient;
use Seed\Organizations\Requests\SearchOrganizationsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->organizations->searchOrganizations(
    'organization_id',
    new SearchOrganizationsRequest([
        'limit' => 1,
    ]),
    'tenant_id',
);
