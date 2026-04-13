<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\UpdateUserRequest;
use Seed\Types\Address;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->updateuser(
    'userId',
    new UpdateUserRequest([
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
