<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\DeserializationTestRequest;
use Seed\Types\UserRole;
use Seed\Types\UserStatus;
use Seed\Types\NotificationMethodZero;
use Seed\Types\NotificationMethodZeroType;
use Seed\Types\SearchResultZero;
use Seed\Types\SearchResultZeroType;
use DateTime;
use Seed\Types\Address;
use Seed\Types\Organization;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->testdeserialization(
    new DeserializationTestRequest([
        'requiredString' => 'requiredString',
        'nullableString' => 'nullableString',
        'optionalString' => 'optionalString',
        'optionalNullableString' => 'optionalNullableString',
        'nullableEnum' => UserRole::Admin->value,
        'optionalEnum' => UserStatus::Active->value,
        'nullableUnion' => new NotificationMethodZero([
            'type' => NotificationMethodZeroType::Email->value,
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ]),
        'optionalUnion' => new SearchResultZero([
            'type' => SearchResultZeroType::User->value,
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
        ]),
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
