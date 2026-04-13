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
    new OrganizationsSearchOrganizationsRequest([
        'tenantId' => 'tenant_id',
        'organizationId' => 'organization_id',
        'limit' => 1,
    ]),
);
