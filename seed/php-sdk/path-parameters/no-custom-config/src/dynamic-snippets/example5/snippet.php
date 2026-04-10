<?php

namespace Example;

use Seed\SeedClient;
use Seed\Organizations\Requests\OrganizationsSearchOrganizationsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->organizations->searchorganizations(
    'tenant_id',
    'organization_id',
    new OrganizationsSearchOrganizationsRequest([
        'limit' => 1,
    ]),
);
