<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Types\UpdateUserRequest;
use Seed\NullableOptional\Types\Address;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->updateUser(
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
        ]),
    ]),
);
