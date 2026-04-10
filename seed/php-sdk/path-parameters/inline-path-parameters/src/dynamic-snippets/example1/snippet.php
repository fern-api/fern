<?php

namespace Example;

use Seed\SeedClient;
use Seed\Organizations\Requests\OrganizationsGetOrganizationRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->organizations->getorganization(
    new OrganizationsGetOrganizationRequest([
        'tenantId' => 'tenant_id',
        'organizationId' => 'organization_id',
    ]),
);
