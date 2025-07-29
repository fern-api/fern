<?php

namespace Example;

use Seed\SeedClient;
use Seed\Organizations\Requests\GetOrganizationUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->organizations->getOrganizationUser(
    new GetOrganizationUserRequest([
        'tenantId' => 'tenant_id',
        'organizationId' => 'organization_id',
        'userId' => 'user_id',
    ]),
);
