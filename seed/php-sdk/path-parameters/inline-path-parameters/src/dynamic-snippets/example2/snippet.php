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
    'tenant_id',
    'organization_id',
    new SearchOrganizationsRequest([
        'limit' => 1,
    ]),
);
