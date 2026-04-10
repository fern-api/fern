<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\CreateUserRequest;
use Seed\Types\Address;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->createuser(
    new CreateUserRequest([
        'username' => 'username',
        'email' => 'email',
        'phone' => 'phone',
        'address' => new Address([
            'street' => 'street',
            'city' => 'city',
            'state' => 'state',
            'zipCode' => 'zipCode',
            'country' => 'country',
            'buildingId' => 'buildingId',
            'tenantId' => 'tenantId',
        ]),
    ]),
);
