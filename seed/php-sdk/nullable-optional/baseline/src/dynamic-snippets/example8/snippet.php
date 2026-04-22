<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Types\DeserializationTestRequest;
use Seed\NullableOptional\Types\UserRole;
use Seed\NullableOptional\Types\UserStatus;
use Seed\NullableOptional\Types\NotificationMethod;
use Seed\NullableOptional\Types\EmailNotification;
use Seed\NullableOptional\Types\SearchResult;
use Seed\NullableOptional\Types\UserResponse;
use DateTime;
use Seed\NullableOptional\Types\Address;
use Seed\NullableOptional\Types\Organization;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->testDeserialization(
    new DeserializationTestRequest([
        'requiredString' => 'requiredString',
        'nullableString' => 'nullableString',
        'optionalString' => 'optionalString',
        'optionalNullableString' => 'optionalNullableString',
        'nullableEnum' => UserRole::Admin->value,
        'optionalEnum' => UserStatus::Active->value,
        'nullableUnion' => NotificationMethod::email(new EmailNotification([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ])),
        'optionalUnion' => SearchResult::user(new UserResponse([
            'id' => 'id',
            'username' => 'username',
            'email' => 'email',
            'phone' => 'phone',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'address' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ])),
        'nullableList' => [
            'nullableList',
            'nullableList',
        ],
        'nullableMap' => [
            'nullableMap' => 1,
        ],
        'nullableObject' => new Address([
            'street' => 'street',
            'city' => 'city',
            'state' => 'state',
            'zipCode' => 'zipCode',
            'country' => 'country',
            'buildingId' => 'buildingId',
            'tenantId' => 'tenantId',
        ]),
        'optionalObject' => new Organization([
            'id' => 'id',
            'name' => 'name',
            'domain' => 'domain',
            'employeeCount' => 1,
        ]),
    ]),
);
