<?php

namespace Example;

use Seed\SeedClient;
use Seed\Organizations\Requests\OrganizationsGetOrganizationUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->organizations->getorganizationuser(
    new OrganizationsGetOrganizationUserRequest([
        'tenantId' => 'tenant_id',
        'organizationId' => 'organization_id',
        'userId' => 'user_id',
    ]),
);
