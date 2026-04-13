<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalFilterByRoleRequest;
use Seed\Types\UserRole;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->filterbyrole(
    new NullableOptionalFilterByRoleRequest([
        'role' => UserRole::Admin->value,
    ]),
);
