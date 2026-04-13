<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\DeserializationTestRequest;
use Seed\Types\UserRole;
use Seed\Types\NotificationMethodZero;
use Seed\Types\NotificationMethodZeroType;
use Seed\Types\Address;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->testdeserialization(
    new DeserializationTestRequest([
        'requiredString' => 'requiredString',
        'nullableEnum' => UserRole::Admin->value,
        'nullableUnion' => new NotificationMethodZero([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'type' => NotificationMethodZeroType::Email->value,
        ]),
        'nullableObject' => new Address([
            'street' => 'street',
            'zipCode' => 'zipCode',
        ]),
    ]),
);
