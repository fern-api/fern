<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Requests\FilterByRoleRequest;
use Seed\NullableOptional\Types\UserRole;
use Seed\NullableOptional\Types\UserStatus;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->filterByRole(
    new FilterByRoleRequest([
        'role' => UserRole::Admin->value,
        'status' => UserStatus::Active->value,
        'secondaryRole' => UserRole::Admin->value,
    ]),
);
