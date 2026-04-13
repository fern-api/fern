<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalFilterByRoleRequest;
use Seed\Types\UserRole;
use Seed\Types\UserStatus;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->filterbyrole(
    new NullableOptionalFilterByRoleRequest([
        'role' => UserRole::Admin->value,
        'status' => UserStatus::Active->value,
        'secondaryRole' => UserRole::Admin->value,
    ]),
);
